import $ from 'jquery'

console.log('chorme', chrome.tabs)
// chrome.browserAction.onClicked.addListener(function (tab) {
//   // No tabs or host permissions needed!
//   console.log('Turning ' + tab.url + ' red!')
//   // chrome.tabs.executeScript({
//   //   code: 'document.body.style.backgroundColor="red"'
//   // });
// })
// ----------------------
// UTILS
// ----------------------

const sleep = (durationMs: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, durationMs)
  })

// ----------------------
// DOMAIN
// ----------------------
interface CommitMetadata {
  duration: number
  date: number
}

type CommitTuple = [HTMLElement, CommitMetadata]
/**
 * TODOS
 *
 * improve design of displayed metadata
 * test it works when navigating on gitlab (see if it triggers again)
 * Handle more gracefully the loading time on commit page
 * handle load more on https://gitlab.com/ekwateur-applications-projects/ruban-app/-/commits/master/
 */

const log = (message: string) =>
  console.log('EXTENSION:', message)

const warn = (message: string) =>
  console.warn('EXTENSION:', message)

async function main() {
  log('init')
  // METHODS
  const displayMetadataForOneCommit = (commit: CommitTuple) => {
    const CUSTOM_CLASS = 'added'
    if (!commit[0].querySelector(`.${CUSTOM_CLASS}`)) {
      const element = document.createElement('div')
      element.className = CUSTOM_CLASS
      element.innerText = `${Math.floor(
        commit[1].duration / (1000 * 60),
      )} min`
      commit[0].append(element)
    }
  }

  const extractDateTimeFromElement = (row: Element) => {
    const COMMIT_DATETIME_SELECTOR =
      'div.commit-content.qa-commit-content > div > time'
    const date = row.querySelector(
      COMMIT_DATETIME_SELECTOR,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore dateTime is possibly not defined
    )?.dateTime

    return new Date(date || null).getTime()
  }

  const addDateOnCommits = (
    commitElements: HTMLElement[],
  ): CommitTuple[] =>
    commitElements.map((row) => {
      return [
        row,
        { date: extractDateTimeFromElement(row), duration: 0 },
      ]
    })

  /**
   * This need to be ran after addDateOnCommits
   */
  const addDurationOnCommits = (
    commits: CommitTuple[],
  ): CommitTuple[] =>
    commits.map(([commitElement, metadata], index, array) => {
      const durationMs = index
        ? metadata.date - array[index - 1][1].date
        : 0
      return [
        commitElement,
        { ...metadata, duration: durationMs },
      ]
    })

  const extractMetadataFromCommitElements = (
    commitElements: HTMLElement[],
  ): CommitTuple[] => {
    const commits = addDateOnCommits(commitElements)
    const dataWithDuration = addDurationOnCommits(commits)
    return dataWithDuration
  }

  // EXECUTION FLOW
  // We need to wait the commits to load
  let commitElements: HTMLElement[] = []
  let retry = 0
  const MAX_RETRY = 15
  const COMMIT_LIST_SELECTOR = 'div.commit-detail.flex-list'
  while (!commitElements.length && retry < MAX_RETRY) {
    commitElements = $(COMMIT_LIST_SELECTOR).toArray().reverse()
    retry++
    await sleep(1000)
  }
  if (!commitElements.length && retry === MAX_RETRY) {
    warn('failure, reload the page')
    return
  }
  log(`processing ${commitElements.length} commits`)

  const commitTuples: CommitTuple[] = extractMetadataFromCommitElements(
    commitElements,
  )
  for (const row of commitTuples) {
    displayMetadataForOneCommit(row)
  }
}
main()
