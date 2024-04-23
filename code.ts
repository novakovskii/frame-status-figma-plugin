let selectedFrames: any[]

let frames_with_statuses: any
let frames_with_statuses_str = figma.currentPage.getPluginData('frames_with_statuses')
if (!frames_with_statuses_str.length) {
  frames_with_statuses = {}
  figma.currentPage.setPluginData('frames_withStatuses', JSON.stringify(frames_with_statuses))
} else {
  frames_with_statuses = JSON.parse(frames_with_statuses_str)
}

function setSelectionState() {
  selectedFrames = []
  let atLeastOneFrameSelected = Boolean(figma.currentPage.selection.reduce((acc, item) => {
    let isElementFrame = item.type === 'FRAME'
    let isElementParentPage = item.parent?.type === 'PAGE'
    if (isElementFrame && isElementParentPage) selectedFrames.push(item)
    return acc + Number(isElementFrame && isElementParentPage)
  }, 0))
  if (figma.ui) figma.ui.postMessage({ type: "setSelectionState", data: {atLeastOneFrameSelected} })
}

figma.currentPage.on("nodechange", (event) => { 
  for (let change of event.nodeChanges) {
    if (!frames_with_statuses[change.id] || change.type !== 'PROPERTY_CHANGE') return
    let isFrameMoved = Boolean(change.properties.reduce((acc, item) => {
      return acc + Number(item === 'x' || item === 'y')
    }, 0))
    if (isFrameMoved) {
      figma.getNodeByIdAsync(frames_with_statuses[change.id].status_bar_id)
        .then(node => {
          if (node && 'x' in node && 'y' in node && 'x' in change.node && 'y' in change.node) {
            node.x = change.node.x + change.node.width - node.width
            node.y = change.node.y - 60
          }
        })
    }
  }
})


figma.clientStorage.getAsync('instruction_completed')
  .then(result => {

    figma.showUI(__html__, {height: 400});


    setSelectionState()

    figma.on("selectionchange", () => { 
      setSelectionState()
    })


    figma.ui.postMessage({ type: "setInstructionState", data: {instruction_completed: result} })

    figma.ui.onmessage =  (msg) => {

      switch (msg.type) {

        case 'completeInstruction':
          figma.clientStorage.setAsync('instruction_completed', true)
          break

        case 'setStatus':

          let savedSelectedFrames = selectedFrames

          selectedFrames.forEach(frame => {

            (async () => {

              await figma.loadFontAsync({ family: "Inter", style: "Regular" })
              await figma.loadFontAsync({ family: "Inter", style: "Semi Bold" })

              let background = {
                r: parseInt(msg.data.background.slice(1, 3), 16) / 255,
                g: parseInt(msg.data.background.slice(3, 5), 16) / 255,
                b: parseInt(msg.data.background.slice(5, 7), 16) / 255
              }

              let color = {
                r: parseInt(msg.data.color.slice(1, 3), 16) / 255,
                g: parseInt(msg.data.color.slice(3, 5), 16) / 255,
                b: parseInt(msg.data.color.slice(5, 7), 16) / 255
              }

              function svgFill(node: any, color: {}) {
                if (node.type === "VECTOR") {
                  node.fills = [{ type: 'SOLID', color }]
                }
                if (node.children) {
                  node.children.forEach((n: any ) => svgFill(n, color))
                }
              }

              let existingStatusBarId = frames_with_statuses[frame.id]?.status_bar_id

              if (existingStatusBarId !== undefined) {
                figma.getNodeByIdAsync(existingStatusBarId)
                  .then(node => {
                    if (node) node.remove()
                  })
              }

              const statusBar = figma.createFrame()
              statusBar.resize(1, 36)
              statusBar.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }]
              statusBar.layoutMode = 'HORIZONTAL'
              statusBar.topLeftRadius = 40
              statusBar.topRightRadius = 40
              statusBar.bottomLeftRadius = 40
              statusBar.bottomRightRadius = 40
              statusBar.counterAxisAlignItems = 'CENTER'
              statusBar.itemSpacing = 16
              statusBar.paddingLeft = 16
              statusBar.locked = true
    
              const statusTag = figma.createFrame()
              statusTag.resize(1, 36)
              statusTag.fills = [{ type: 'SOLID', color: background }]
              statusTag.layoutMode = 'HORIZONTAL'
              statusTag.paddingLeft = 16
              statusTag.paddingRight = 24
              statusTag.paddingTop = 8
              statusTag.paddingBottom = 8
              statusTag.itemSpacing = 8
              statusTag.topLeftRadius = 0
              statusTag.topRightRadius = 40
              statusTag.bottomLeftRadius = 40
              statusTag.bottomRightRadius = 40

              const iconContent = msg.data.icon
              const icon = figma.createNodeFromSvg(iconContent)
              icon.resize(20, 20)
              svgFill(icon, color)

              const statusName = figma.createText()
              statusName.characters = msg.data.name
              statusName.fontSize = 16
              statusName.fills = [{ type: 'SOLID', color }]
              statusName.fontName = { family: "Inter", style: "Semi Bold" }

              const userNameNode = figma.createText()
              const userName = figma.currentUser?.name ?? 'unidentified user'
              userNameNode.characters = userName
              userNameNode.fontSize = 14
              userNameNode.fills = [{ type: 'SOLID', color: { r: 119/255, g: 120/255, b: 124/255 } }]

              const currentDate = figma.createText()
              currentDate.characters = msg.data.currentDate
              currentDate.fontSize = 14
              currentDate.fills = [{ type: 'SOLID', color: { r: 119/255, g: 120/255, b: 124/255 } }]
              
              statusTag.appendChild(icon)
              statusTag.appendChild(statusName)
              statusBar.appendChild(userNameNode)
              statusBar.appendChild(currentDate)
              statusBar.appendChild(statusTag)

              const group = figma.group([statusBar], figma.currentPage)
              group.expanded = false
              group.x = frame.x + frame.width - group.width
              group.y = frame.y - 60
              
              frames_with_statuses[frame.id] = {
                status_bar_id: group.id,
                status: {
                  id: msg.data.id,
                  name: msg.data.name,
                  icon: msg.data.icon,
                  color: msg.data.color,
                  background: msg.data.background,
                  user_name: userName,
                  datetime: msg.data.currentDate
                }
              }

              figma.currentPage.setPluginData('frames_with_statuses', JSON.stringify(frames_with_statuses))

            })()
            
          })

          figma.currentPage.selection = savedSelectedFrames
          
          break

        case '':

          break
      }
      
    };
  })



