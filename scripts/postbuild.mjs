import { unlink, writeFile } from 'node:fs/promises'
import siteMetadata from '../articles/siteMetadata.js'
import rss from './rss.mjs'

const GITHUB_PAGES_HOST_SUFFIX = '.github.io'
const CNAME_OUTPUT_PATH = './out/CNAME'

function toHostname(value) {
  const trimmedValue = value?.trim()

  if (!trimmedValue) {
    return null
  }

  try {
    const normalizedValue = trimmedValue.includes('://')
      ? trimmedValue
      : `https://${trimmedValue}`
    return new URL(normalizedValue).hostname.toLowerCase()
  } catch {
    return null
  }
}

function isSubPathSite(value) {
  try {
    return new URL(value).pathname.replace(/\/$/, '') !== ''
  } catch {
    return false
  }
}

function resolveCname() {
  if (process.env.GITHUB_PAGES_CNAME) {
    return toHostname(process.env.GITHUB_PAGES_CNAME)
  }
  // cdd.co.kr/blog 처럼 하위 경로 사이트면 도메인은 devcdd.github.io 저장소가 관리함
  if (isSubPathSite(siteMetadata.siteUrl)) {
    return null
  }
  return toHostname(siteMetadata.siteUrl)
}

async function syncCname() {
  const cname = resolveCname()

  if (!cname || cname.endsWith(GITHUB_PAGES_HOST_SUFFIX)) {
    await unlink(CNAME_OUTPUT_PATH).catch((error) => {
      if (error.code !== 'ENOENT') {
        throw error
      }
    })
    console.log('Skipped CNAME generation.')
    return
  }

  await writeFile(CNAME_OUTPUT_PATH, `${cname}\n`, 'utf8')
  console.log(`CNAME generated for ${cname}.`)
}

async function postbuild() {
  await rss()
  await syncCname()
}

postbuild()
