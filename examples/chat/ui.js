const diffy = require('diffy')({fullscreen: true})
const input = require('diffy/input')({showCursor: true})
const stripAnsi = require('strip-ansi')

function initUI (model, postMessage) {
  render(model)
  input.on('update', () => { render(model) })
  input.on('enter', line => {
    model.doc = postMessage(line)
    render(model)
  })
  // For network connection display
  setInterval(() => { render(model) }, 3000)
}

function render (model) {
  let nick = model.nick
  let channelHex = model.channelHex
  let doc = model.doc

  diffy.render(() => {
    let output = ''
    output += `Join: npx hm-chat ${channelHex}\n`
    output += `${model.getNumConnections()} connections. `
    output += `Use Ctrl-C to exit.\n\n`
    let displayMessages = []
    let {messages} = doc
    Object.keys(messages).sort().forEach(key => {
      if (key === '_objectId') return
      if (key === '_conflicts') return
      const {nick, message, joined} = messages[key]
      if (joined) {
        displayMessages.push(`${nick} has joined.`)
      } else {
        if (message) {
          displayMessages.push(`${nick}: ${message}`)
        }
      }
    })
    // Delete old messages
    const maxMessages = diffy.height - output.split('\n').length - 2
    displayMessages.splice(0, displayMessages.length - maxMessages)
    displayMessages.forEach(line => {
      output += stripAnsi(line).substr(0, diffy.width - 2) + '\n'
    })
    for (let i = displayMessages.length; i < maxMessages; i++) {
      output += '\n'
    }
    output += `\n[${nick}] ${input.line()}`
    return output
  })
}

module.exports = {initUI, render}
