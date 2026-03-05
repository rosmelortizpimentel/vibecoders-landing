

# Plan: Create "Builder Pro 19.90" Stripe Plan and Update Database

## Steps

### 1. Create Stripe Product + Price
- Create a new Stripe product named **"Builder Pro 19.90"** with a description matching the Early Adopter plan style.
- Create a recurring yearly price of **$19.90 USD** on that product.

### 2. Update `general_settings` in the Database
Update 3 rows in `general_settings` to point to the new plan:
- `stripe_active_price_id` → new price ID
- `stripe_active_price_amount` → `19.90`
- `stripe_active_product_name` → `Builder Pro 19.90`

No frontend or backend code changes needed -- the `create-checkout-session` edge function already reads `stripe_active_price_id` from `general_settings` dynamically.

