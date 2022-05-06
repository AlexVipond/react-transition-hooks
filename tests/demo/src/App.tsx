/// <reference types="vite-plugin-pages/client-react" />
import { Suspense, useState } from 'react'
import { useRoutes, Link } from "react-router-dom"
import routes from '~react-pages'

export function App() {
  return (
    <div className="flex flex-col gap-10 p-14">
      <div>
        <nav className="flex flex-col gap-2">
          {routes.filter(route => route.path).map(route => (
            <Link
              key={route.path}
              to={`/${route.path}`}
              className="text-xl text-blue-500 no-underline hover:underline"
            >{`/${route.path}`}</Link>
          ))}
        </nav>
      </div>
      <div>
        <Suspense fallback={<div>Loading... </div>}>
          {useRoutes(routes)}
        </Suspense>
      </div>
    </div>
  )
}
