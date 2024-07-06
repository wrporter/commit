import { installGlobals } from '@remix-run/node'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

installGlobals()

afterEach(() => cleanup())
