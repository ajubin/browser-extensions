// Background is not needed for now
/*
chrome.browserAction.onClicked.addListener(() => {
  alert('you clicked?')
})

chrome.runtime.onMessage.addListener(({ greeting }) => {
  alert(`you said, "${greeting}"`)
})
*/
console.log('chorme', chrome.tabs)
chrome.browserAction.onClicked.addListener(function (tab) {
  // No tabs or host permissions needed!
  console.log('Turning ' + tab.url + ' red!')
  // chrome.tabs.executeScript({
  //   code: 'document.body.style.backgroundColor="red"'
  // });
})
