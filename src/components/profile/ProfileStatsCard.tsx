 import { Eye, MousePointerClick } from 'lucide-react';
 
 interface ProfileStatsCardProps {
   profileViews: number;
   appClicks: number;
 }
 
 function formatNumber(num: number): string {
   if (num >= 1000000) {
     return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
   }
   if (num >= 1000) {
     return num.toLocaleString('en-US');
   }
   return num.toString();
 }
 
 export function ProfileStatsCard({ profileViews, appClicks }: ProfileStatsCardProps) {
   return (
     <div className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 border border-gray-100">
       <div className="flex items-center gap-2">
         <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
           <Eye className="w-4 h-4 text-blue-600" />
         </div>
         <div>
           <p className="text-sm font-semibold text-gray-900">{formatNumber(profileViews)}</p>
           <p className="text-[10px] text-gray-500">Visitas</p>
         </div>
       </div>
       
       <div className="w-px h-8 bg-gray-200" />
       
       <div className="flex items-center gap-2">
         <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
           <MousePointerClick className="w-4 h-4 text-purple-600" />
         </div>
         <div>
           <p className="text-sm font-semibold text-gray-900">{formatNumber(appClicks)}</p>
           <p className="text-[10px] text-gray-500">Clicks</p>
         </div>
       </div>
     </div>
   );
 }