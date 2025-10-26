import React from 'react'
import Logo from './logo'

export default function Footer() {
   return (
      <footer className="border-t py-8">
         <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
               <div className="flex items-center gap-2">
                  <Logo />
               </div>
               <p className="text-sm text-muted-foreground">
                  © 2025 FitTracker. All rights reserved.
               </p>
            </div>
         </div>
      </footer>
   )
}
