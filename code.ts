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

async function createStatusBar(
  status: {
    background: { r: number, g: number, b: number },
    color: { r: number, g: number, b: number },
    icon: string,
    name: string
  },
  userName: string,
  currentDate: string
) {
  await figma.loadFontAsync({ family: "Inter", style: "Regular" })
  await figma.loadFontAsync({ family: "Inter", style: "Semi Bold" })

  const statusBarNode = figma.createFrame()
  statusBarNode.resize(1, 36)
  statusBarNode.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }]
  statusBarNode.layoutMode = 'HORIZONTAL'
  statusBarNode.topLeftRadius = 40
  statusBarNode.topRightRadius = 40
  statusBarNode.bottomLeftRadius = 40
  statusBarNode.bottomRightRadius = 40
  statusBarNode.counterAxisAlignItems = 'CENTER'
  statusBarNode.itemSpacing = 16
  statusBarNode.paddingLeft = 16
  statusBarNode.locked = true

  const statusTagNode = figma.createFrame()
  statusTagNode.resize(1, 36)
  statusTagNode.fills = [{ type: 'SOLID', color: status.background }]
  statusTagNode.layoutMode = 'HORIZONTAL'
  statusTagNode.paddingLeft = 16
  statusTagNode.paddingRight = 24
  statusTagNode.paddingTop = 8
  statusTagNode.paddingBottom = 8
  statusTagNode.itemSpacing = 8
  statusTagNode.topLeftRadius = 0
  statusTagNode.topRightRadius = 40
  statusTagNode.bottomLeftRadius = 40
  statusTagNode.bottomRightRadius = 40

  const iconNode = figma.createNodeFromSvg(status.icon)
  iconNode.resize(20, 20)
  svgFill(iconNode, status.color)

  const statusNameNode = figma.createText()
  statusNameNode.characters = status.name
  statusNameNode.fontSize = 16
  statusNameNode.fills = [{ type: 'SOLID', color: status.color }]
  statusNameNode.fontName = { family: "Inter", style: "Semi Bold" }

  const userNameNode = figma.createText()
  userNameNode.characters = userName
  userNameNode.fontSize = 14
  userNameNode.fills = [{ type: 'SOLID', color: { r: 119/255, g: 120/255, b: 124/255 } }]

  const currentDateNode = figma.createText()
  currentDateNode.characters = currentDate
  currentDateNode.fontSize = 14
  currentDateNode.fills = [{ type: 'SOLID', color: { r: 119/255, g: 120/255, b: 124/255 } }]

  statusTagNode.appendChild(iconNode)
  statusTagNode.appendChild(statusNameNode)
  statusBarNode.appendChild(userNameNode)
  statusBarNode.appendChild(currentDateNode)
  statusBarNode.appendChild(statusTagNode)

  const statusBarGroup = figma.group([statusBarNode], figma.currentPage)
  statusBarGroup.name = 'Status'
  statusBarGroup.expanded = false

  return statusBarGroup
}

function positionStatusBarGroup(statusBarGroup: any, frame: any) {
  statusBarGroup.x = frame.x + frame.width - statusBarGroup.width
  statusBarGroup.y = frame.y - 60
}

figma.currentPage.on("nodechange", (event) => { 
  for (let change of event.nodeChanges) {
    if (!framesWithStatuses[change.id] || change.type !== 'PROPERTY_CHANGE') return

    const isFrameMoved = change.properties.reduce((acc, item) => {
      return acc || item === 'x' || item === 'y'
    }, false)
    if (!isFrameMoved) return
    
    const statusBarNode = framesWithStatuses[change.id].status_bar_node
    if (statusBarNode && 'x' in change.node && 'y' in change.node) {
      statusBarNode.x = change.node.x + change.node.width - statusBarNode.width
      statusBarNode.y = change.node.y - 60
    } else {
      figma.getNodeByIdAsync(framesWithStatuses[change.id].status_bar_id)
      .then(node => {
        framesWithStatuses[change.id].status_bar_node = node
        if (node && 'x' in node && 'y' in node && 'x' in change.node && 'y' in change.node) {
          positionStatusBarGroup(node, change.node)
        }
      })
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

            let existingStatusBarId = framesWithStatuses[frame.id]?.status_bar_id
            if (existingStatusBarId !== undefined) {
              figma.getNodeByIdAsync(existingStatusBarId)
                .then(node => {
                  if (node) node.remove()
                })
            }

            const status = {
              background: {
                r: parseInt(msg.data.background.slice(1, 3), 16) / 255,
                g: parseInt(msg.data.background.slice(3, 5), 16) / 255,
                b: parseInt(msg.data.background.slice(5, 7), 16) / 255
              },
              color: {
                r: parseInt(msg.data.color.slice(1, 3), 16) / 255,
                g: parseInt(msg.data.color.slice(3, 5), 16) / 255,
                b: parseInt(msg.data.color.slice(5, 7), 16) / 255
              },
              icon: msg.data.icon,
              name: msg.data.name,
              id: msg.data.id
            };

            const userName = figma.currentUser?.name ?? 'Unidentified user';
            const currentDate = msg.data.currentDate;
            
            createStatusBar(status, userName, currentDate)
              .then((statusBarGroup) => {
                positionStatusBarGroup(statusBarGroup, frame)

                framesWithStatuses[frame.id] = {
                  status_bar_id: statusBarGroup.id,
                  status,
                  user_name: userName,
                  datetime: currentDate
                }
  
                figma.root.setPluginData('frames_with_statuses', JSON.stringify(framesWithStatuses))
              })
            
            
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
                figma.getNodeByIdAsync(frameId)
                  .then(frameNode => {
                    createStatusBar(framesWithStatuses[frameId].status, framesWithStatuses[frameId].user_name, framesWithStatuses[frameId].datetime)
                      .then((statusBarGroup) => {
                        positionStatusBarGroup(statusBarGroup, frameNode)

                        framesWithStatuses[frameId].status_bar_id = statusBarGroup.id
                        figma.root.setPluginData('frames_with_statuses', JSON.stringify(framesWithStatuses))
                        framesWithStatuses[frameId].status_bar_node = statusBarGroup
                      })
                  })
              } else {
                figma.getNodeByIdAsync(frameId)
                  .then(frameNode => {
                    positionStatusBarGroup(node, frameNode)
                  })
              }
            })
          }

        break
      }
      
    };
  })



