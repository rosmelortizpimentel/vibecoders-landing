import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // ── 1. Authenticate the Vibecoders user ──
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing Authorization header' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      })
    }

    const token = authHeader.replace('Bearer ', '')

    const vibecodersClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
    )
    const { data: { user }, error: userError } = await vibecodersClient.auth.getUser(token)
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      })
    }

    // ── 2. Parse request ──
    const { action, payload } = await req.json()

    // ── 3. Initialize clients ──
    const toggleupUrl = Deno.env.get('TOGGLEUP_URL')
    const toggleupServiceKey = Deno.env.get('TOGGLEUP_SERVICE_ROLE_KEY')
    if (!toggleupUrl || !toggleupServiceKey) {
      return new Response(JSON.stringify({ error: 'Missing ToggleUp config. Set TOGGLEUP_URL and TOGGLEUP_SERVICE_ROLE_KEY secrets.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      })
    }

    const toggleupAdmin = createClient(toggleupUrl, toggleupServiceKey)

    // Vibecoders admin client for mapping table (uses service role to bypass RLS)
    const vibecodersAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    // ── 4. Helper: Resolve vibecoders app → toggleup project (with auto-creation) ──
    async function resolveMapping(vibecodersAppId: string, appName?: string): Promise<{ id: string, api_key: string }> {
      // Look up existing mapping
      const { data: mapping } = await vibecodersAdmin
        .from('app_toggleup_mapping')
        .select('toggleup_project_id, user_id')
        .eq('vibecoders_app_id', vibecodersAppId)
        .maybeSingle()

      if (mapping) {
        // ✅ Verify ownership: mapping must belong to authenticated user
        if (mapping.user_id !== user!.id) {
          throw { status: 403, message: 'Forbidden: you do not own this app mapping' }
        }
        
        // Fetch the api_key from ToggleUp projects table
        const { data: projData } = await toggleupAdmin
          .from('projects')
          .select('api_key')
          .eq('id', mapping.toggleup_project_id)
          .single()
          
        return { 
          id: mapping.toggleup_project_id,
          api_key: projData?.api_key || ''
        }
      }

      // No mapping exists → auto-create project in ToggleUp
      const projectName = appName || 'Vibecoders App'

      // Resolve or create a ToggleUp user for this Vibecoders user
      let toggleupUserId: string

      // Search by email in ToggleUp profiles table (most reliable)
      const { data: existingProfile } = await toggleupAdmin
        .from('profiles')
        .select('id')
        .eq('email', user!.email)
        .maybeSingle()

      if (existingProfile) {
        // User already has a ToggleUp account — use their existing ID
        toggleupUserId = existingProfile.id
        console.log('Found existing ToggleUp profile for email:', user!.email, '→', toggleupUserId)
      } else {
        // Create new user in ToggleUp (trigger will auto-create profile)
        const { data: newUser, error: authError } = await toggleupAdmin.auth.admin.createUser({
          email: user!.email!,
          email_confirm: true,
          user_metadata: { source: 'vibecoders_proxy' },
        })

        if (authError) {
          console.error('Error creating ToggleUp user:', JSON.stringify(authError))
          throw { status: 500, message: 'Failed to create ToggleUp user: ' + authError.message }
        }

        toggleupUserId = newUser.user.id
        console.log('Created new ToggleUp user:', toggleupUserId)

        // Wait a moment for the trigger to create the profile
        await new Promise(resolve => setTimeout(resolve, 500))
      }

      const { data: newProject, error: projError } = await toggleupAdmin
        .from('projects')
        .insert({
          user_id: toggleupUserId,
          name: projectName,
          domain: 'vibecoders-synced',
        })
        .select('id, api_key')
        .single()

      if (projError) {
        console.error('Error creating ToggleUp project:', JSON.stringify(projError))
        throw { status: 500, message: 'Failed to create ToggleUp project: ' + JSON.stringify(projError) }
      }

      // Store the mapping in Vibecoders DB
      const { error: mapError } = await vibecodersAdmin
        .from('app_toggleup_mapping')
        .insert({
          user_id: user!.id,
          vibecoders_app_id: vibecodersAppId,
          toggleup_project_id: newProject.id,
        })

      if (mapError) {
        console.error('Error storing mapping:', JSON.stringify(mapError))
        // Clean up the orphaned project
        await toggleupAdmin.from('projects').delete().eq('id', newProject.id)
        throw { status: 500, message: 'Failed to store app mapping' }
      }

      return {
        id: newProject.id,
        api_key: newProject.api_key
      }
    }

    // ── 5. Helper: Verify popup ownership ──
    async function verifyPopupOwnership(popupId: string): Promise<string> {
      // Get the popup's project_id from ToggleUp
      const { data: popup, error } = await toggleupAdmin
        .from('popups')
        .select('project_id')
        .eq('id', popupId)
        .single()

      if (error || !popup) {
        throw { status: 404, message: 'Popup not found' }
      }

      // Verify the project belongs to this user via our mapping
      const { data: mapping } = await vibecodersAdmin
        .from('app_toggleup_mapping')
        .select('user_id')
        .eq('toggleup_project_id', popup.project_id)
        .maybeSingle()

      if (!mapping || mapping.user_id !== user!.id) {
        throw { status: 403, message: 'Forbidden: you do not own this popup' }
      }

      return popup.project_id
    }

    // ── 6. Handle Actions ──
    let responseData: Record<string, unknown> = {}

    switch (action) {
      case 'get_popups': {
        const { vibecodersAppId, appName } = payload || {}
        if (!vibecodersAppId) throw { status: 400, message: 'vibecodersAppId is required' }

        const project = await resolveMapping(vibecodersAppId, appName)
        const projectId = project.id

        const { data: popups, error: e } = await toggleupAdmin
          .from('popups')
          .select('*')
          .eq('project_id', projectId)
          .order('created_at', { ascending: false })
        if (e) {
          console.error('get_popups error:', JSON.stringify(e))
          throw e
        }
        responseData = { 
          popups: popups || [],
          projectId: projectId,
          api_key: project.api_key
        }
        break
      }

      case 'create_popup': {
        const { vibecodersAppId, appName, popupData } = payload || {}
        if (!vibecodersAppId) throw { status: 400, message: 'vibecodersAppId is required' }

        const project = await resolveMapping(vibecodersAppId, appName)
        const projectId = project.id

        // Only allow safe fields through
        const { data: popup, error: e } = await toggleupAdmin
          .from('popups')
          .insert({
            project_id: projectId,
            name: popupData?.name || 'Untitled Banner',
            config: popupData?.config || {},
            rules: popupData?.rules || {},
            is_active: popupData?.is_active ?? false,
          })
          .select()
          .single()
        if (e) {
          console.error('create_popup error:', JSON.stringify(e))
          throw e
        }
        responseData = { popup, api_key: project.api_key }
        break
      }

      case 'update_popup': {
        const { popupId, updates } = payload || {}
        if (!popupId) throw { status: 400, message: 'popupId is required' }

        await verifyPopupOwnership(popupId)

        // Only allow safe update fields
        const safeUpdates: Record<string, unknown> = {}
        if (updates?.name !== undefined) safeUpdates.name = updates.name
        if (updates?.config !== undefined) safeUpdates.config = updates.config
        if (updates?.rules !== undefined) safeUpdates.rules = updates.rules
        if (updates?.is_active !== undefined) safeUpdates.is_active = updates.is_active
        if (updates?.start_at !== undefined) safeUpdates.start_at = updates.start_at
        if (updates?.end_at !== undefined) safeUpdates.end_at = updates.end_at
        safeUpdates.updated_at = new Date().toISOString()

        const { data: popup, error: e } = await toggleupAdmin
          .from('popups')
          .update(safeUpdates)
          .eq('id', popupId)
          .select()
          .single()
        if (e) {
          console.error('update_popup error:', JSON.stringify(e))
          throw e
        }
        responseData = { popup }
        break
      }

      case 'delete_popup': {
        const { popupId } = payload || {}
        if (!popupId) throw { status: 400, message: 'popupId is required' }

        await verifyPopupOwnership(popupId)

        const { error: e } = await toggleupAdmin
          .from('popups')
          .delete()
          .eq('id', popupId)
        if (e) {
          console.error('delete_popup error:', JSON.stringify(e))
          throw e
        }
        responseData = { deleted: true }
        break
      }

      case 'get_branding': {
        const { vibecodersAppId } = payload || {}
        if (!vibecodersAppId) throw { status: 400, message: 'vibecodersAppId is required' }
        const domain = `${vibecodersAppId}.vibecoders.la`
        
        const { data, error: e } = await toggleupAdmin
          .from('domain_scrapes')
          .select('*')
          .eq('domain', domain)
          .maybeSingle()
        if (e) {
          console.error('get_branding error:', JSON.stringify(e))
          throw e
        }
        responseData = { 
          branding: data?.branding || {}, 
          domainScrape: data 
        }
        break
      }

      case 'update_branding': {
        const { vibecodersAppId, branding } = payload || {}
        if (!vibecodersAppId) throw { status: 400, message: 'vibecodersAppId is required' }
        const domain = `${vibecodersAppId}.vibecoders.la`

        // Check if exists
        const { data: existing, error: checkError } = await toggleupAdmin
          .from('domain_scrapes')
          .select('id')
          .eq('domain', domain)
          .maybeSingle()

        if (checkError) {
          console.error('update_branding check error:', JSON.stringify(checkError))
          throw checkError
        }

        if (existing) {
          const { error: e } = await toggleupAdmin
            .from('domain_scrapes')
            .update({ 
               branding,
               updated_at: new Date().toISOString()
            })
            .eq('domain', domain)
          if (e) {
            console.error('update_branding update error:', JSON.stringify(e))
            throw e
          }
        } else {
          const { error: e } = await toggleupAdmin
            .from('domain_scrapes')
            .insert({ 
              domain, 
              branding, 
              status: 'completed',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
          if (e) {
            console.error('update_branding insert error:', JSON.stringify(e))
            throw e
          }
        }
        responseData = { success: true }
        break
      }

      case 'generate_popup_config': {
        const { prompt, branding, logoUrl, currentConfig, conversationHistory, projectId, popupId } = payload || {}
        
        const toggleupServiceKey = Deno.env.get('TOGGLEUP_SERVICE_ROLE_KEY')
        const toggleupUrl = Deno.env.get('TOGGLEUP_URL')
        if (!toggleupUrl || !toggleupServiceKey) throw new Error('ToggleUp configuration missing')
        
        const response = await fetch(`${toggleupUrl}/functions/v1/generate-popup-config`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${toggleupServiceKey}`
          },
          body: JSON.stringify({ prompt, branding, logoUrl, currentConfig, conversationHistory, projectId, popupId })
        })
        
        if (!response.ok) {
           const errText = await response.text()
           throw new Error(`ToggleUp AI Error: ${errText}`)
        }
        
        responseData = await response.json()
        break
      }

      default:
        throw { status: 400, message: `Unknown action: ${action}` }
    }

    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error: unknown) {
    const status = (error as any)?.status || 500
    let msg: string
    if (error instanceof Error) {
      msg = error.message
    } else if (typeof error === 'object' && error !== null && 'message' in error) {
      msg = (error as any).message
    } else if (typeof error === 'object' && error !== null) {
      msg = JSON.stringify(error)
    } else {
      msg = String(error)
    }
    console.error('Proxy Error:', msg)
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status,
    })
  }
})
