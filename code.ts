let selectedFrames: any[]

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

// figma.currentPage.on("nodechange", (event) => { 
//   console.log(event)
// })


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

        case 'closeInstruction':
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

              let existingStatusBarId = frame.getPluginData('status-bar-id')
              if (existingStatusBarId.length > 0) {
                figma.getNodeByIdAsync(existingStatusBarId)
                  .then(node => {
                    if (node) node.remove()
                  })
              }

              const statusBar = figma.createFrame()
              statusBar.x = frame.x
              statusBar.y = frame.y - 60
              statusBar.resize(1, 36)
              statusBar.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }]
              statusBar.layoutMode = 'HORIZONTAL'
              statusBar.topLeftRadius = 40
              statusBar.topRightRadius = 40
              statusBar.bottomLeftRadius = 40
              statusBar.bottomRightRadius = 40
              statusBar.counterAxisAlignItems = 'CENTER'
              statusBar.itemSpacing = 16
              statusBar.paddingRight = 16
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
              statusTag.topLeftRadius = 40
              statusTag.topRightRadius = 0
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

              const userName = figma.createText()
              userName.characters = figma.currentUser?.name ?? 'unidentified user'
              userName.fontSize = 14
              userName.fills = [{ type: 'SOLID', color: { r: 119/255, g: 120/255, b: 124/255 } }]

              const currentDate = figma.createText()
              currentDate.characters = msg.data.currentDate
              currentDate.fontSize = 14
              currentDate.fills = [{ type: 'SOLID', color: { r: 119/255, g: 120/255, b: 124/255 } }]
              
              statusTag.appendChild(icon)
              statusTag.appendChild(statusName)
              statusBar.appendChild(statusTag)
              statusBar.appendChild(userName)
              statusBar.appendChild(currentDate)
              statusBar.expanded = false
              
              frame.setPluginData('status-bar-id', statusBar.id)

              
            })()
            
          })

          figma.currentPage.selection = savedSelectedFrames
          
          break

        case '':

          break
      }
      
    };
  })



