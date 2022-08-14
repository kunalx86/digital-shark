// pages/_document.js

import { ColorModeScript } from '@chakra-ui/react'
import { Head, Html, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html style={{
      padding: 0,
      margin: 0,
      height: "100%"
    }} lang='en'>
      <Head />
      <body style={{
        margin: 0,
        padding: 0,
        minHeight: "100%",
        display: "flex",
        flexDirection: "column"
      }}>
        {/* 👇 Here's the script */}
        <ColorModeScript />
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}