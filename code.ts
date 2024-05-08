const selectedFrames: any[] = []
const framesWithStatuses: any = {}
let customStatuses: any[] = []
let framesWithRemovingStatus: any[] = []

if (figma.root.getPluginData('frames_with_statuses')) {
  Object.assign(framesWithStatuses, JSON.parse(figma.root.getPluginData('frames_with_statuses')))
}

if (figma.root.getPluginData('custom_statuses')) {
  customStatuses = JSON.parse(figma.root.getPluginData('custom_statuses'))
}

function onSelectionChange() {
  selectedFrames.length = 0
  let atLeastOneRootFrameSelected = figma.currentPage.selection.reduce((acc, item) => {
    let isFrame = item.type === 'FRAME'
    let isChildOfPage = item.parent?.type === 'PAGE'
    if (isFrame && isChildOfPage) selectedFrames.push(item)
    return acc || isFrame && isChildOfPage
  }, false)
  let statusesCount: any = {}
  for (let selectedFrame of selectedFrames) {
    if (framesWithStatuses[selectedFrame.id]) {
      let statusId = framesWithStatuses[selectedFrame.id].status.id
      statusesCount[statusId] ? statusesCount[statusId] ++ : statusesCount[statusId] = 1
    }
  }
  figma.ui.postMessage({ type: "onSelectionChange", data: {atLeastOneRootFrameSelected, statusesCount} })
}

function svgFill(node: any, color: {}) {
  if (node.type === "VECTOR") {
    node.fills = [{ type: 'SOLID', color }]
  }
  if (node.children) {
    node.children.forEach((n: any ) => svgFill(n, color))
  }
}

figma.currentPage.on("nodechange", (event) => { 
  for (let change of event.nodeChanges) {
    if (!framesWithStatuses[change.id] || change.type !== 'PROPERTY_CHANGE') return
    let isFrameMoved = change.properties.reduce((acc, item) => {
      return acc || item === 'x' || item === 'y'
    }, false)
    if (isFrameMoved) {
      let statusBarNode = framesWithStatuses[change.id].status_bar_node
      if (statusBarNode && 'x' in change.node && 'y' in change.node) {
        statusBarNode.x = change.node.x + change.node.width - statusBarNode.width
        statusBarNode.y = change.node.y - 60
      } else {
        figma.getNodeByIdAsync(framesWithStatuses[change.id].status_bar_id)
        .then(node => {
          framesWithStatuses[change.id].status_bar_node = node
          if (node && 'x' in node && 'y' in node && 'x' in change.node && 'y' in change.node) {
            node.x = change.node.x + change.node.width - node.width
            node.y = change.node.y - 60
          }
        })
      }
    }
  }
})

figma.on("selectionchange", () => { 
  onSelectionChange()
})


figma.clientStorage.getAsync('instruction_completed')
  .then(result => {

    figma.showUI(__html__, {height: 400});


    onSelectionChange()

    

    figma.ui.postMessage({ type: "setInstructionState", data: {instruction_completed: result} })
    figma.ui.postMessage({ type: "sendCustomStatuses", data: customStatuses })

    figma.ui.onmessage =  (msg) => {

      switch (msg.type) {

        case 'completeInstruction':
          figma.clientStorage.setAsync('instruction_completed', true)
          break

        case 'setStatus':


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

              

              let existingStatusBarId = framesWithStatuses[frame.id]?.status_bar_id

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
              
              framesWithStatuses[frame.id] = {
                status_bar_id: group.id,
                status: {
                  id: msg.data.id,
                  name: msg.data.name,
                  icon: msg.data.icon,
                  color: msg.data.color,
                  background: msg.data.background
                },
                user_name: userName,
                datetime: msg.data.currentDate
              }

              figma.root.setPluginData('frames_with_statuses', JSON.stringify(framesWithStatuses))

            })()
            
          })

          setTimeout(() => {
            onSelectionChange()
          }, 100)

          
        break

        case 'saveCustomStatuses':

          customStatuses = msg.data
          figma.root.setPluginData('custom_statuses', JSON.stringify(customStatuses))

        break

        case 'removeStatuses':

          for (let frame of selectedFrames) {
            if (framesWithStatuses[frame.id]) {
              figma.getNodeByIdAsync(framesWithStatuses[frame.id].status_bar_id)
                .then(node => {
                  if (node) node.remove()
                  delete framesWithStatuses[frame.id]
                  onSelectionChange()
                  figma.root.setPluginData('frames_with_statuses', JSON.stringify(framesWithStatuses))
                })
            }
          }
        break

        case 'removeAllStatuses':

          for (let frameId in framesWithStatuses) {
            figma.getNodeByIdAsync(framesWithStatuses[frameId].status_bar_id)
              .then(node => {
                if (node) node.remove()
                delete framesWithStatuses[frameId]
                onSelectionChange()
                figma.root.setPluginData('frames_with_statuses', JSON.stringify(framesWithStatuses))
              })
          }
        break

        case 'removeCustomStatus':

          const entries = Object.entries(framesWithStatuses).filter((item: any) => item[1].status.id === msg.data.id)
          
          if (!entries.length) {
            figma.ui.postMessage({ type: "removeCustomStatus", data: {id: msg.data.id} })
            return
          }

          if (msg.data.force) {
            figma.ui.postMessage({ type: "removeCustomStatus", data: {id: msg.data.id} })
            for (let entry of entries) {
              figma.getNodeByIdAsync((entry[1] as { status_bar_id: string }).status_bar_id)
                .then(node => {
                  if (node) node.remove()
                  delete framesWithStatuses[entry[0]]
                  onSelectionChange()
                  figma.root.setPluginData('frames_with_statuses', JSON.stringify(framesWithStatuses))
                })
            }
            return
          }

          const promiseArray: any[] = []
          for (let entry of entries) {
            promiseArray.push(figma.getNodeByIdAsync(entry[0]))
          }

          framesWithRemovingStatus = []
          Promise.all(promiseArray)
            .then(nodes => {
              framesWithRemovingStatus = nodes
              figma.ui.postMessage({ type: "sendFramesWithRemovingStatus", data: nodes.map(item => {
                return {
                  id: item.id,
                  name: item.name
                }
              }) })
            })

          
          
        break

        case 'goToFrame':

          const frame = framesWithRemovingStatus.find(item => item.id === msg.data.id)
          if (frame.parent.id !== figma.currentPage.id) {
            figma.setCurrentPageAsync(frame.parent)
              .then(() => {
                figma.viewport.scrollAndZoomIntoView([frame])
                figma.currentPage.selection = [frame]
              })
          } else {
            figma.viewport.scrollAndZoomIntoView([frame])
            figma.currentPage.selection = [frame]
          }

        break

        case 'update':

        for (let frameId in framesWithStatuses) {
          figma.getNodeByIdAsync(framesWithStatuses[frameId].status_bar_id)
            .then(node => {
              if (!node) {

              }
            })
          }

        break
      }
      
    };
  })



