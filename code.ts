interface PluginState {
  showOnboarding: boolean;
  validNodeTypes: {
    name: string;
    types: string[];
    enabled: boolean;
  }[];
  validSelection: SceneNode[];
  customStatuses: Status[];
  elementIdsToStatusBarIds: Map<string, string>
}

interface Status {
  name: string;
  id: string;
  background: string;
  color: string;
  icon: string;
}

const pluginState: PluginState = {
  showOnboarding: true,
  validNodeTypes: [],
  validSelection: [],
  customStatuses: [],
  elementIdsToStatusBarIds: new Map()
};

initializePlugin();

async function initializePlugin() {
  addRelaunchButton();
  await loadPluginData();

  createUI();

  sendUIMessage({
    type: 'setOnboardingState',
    data: { showOnboarding: pluginState.showOnboarding },
  });
  sendUIMessage({
    type: 'setCustomStatuses',
    data: pluginState.customStatuses,
  });
  sendUIMessage({
    type: 'setValidNodeTypes',
    data: pluginState.validNodeTypes,
  });

  onSelectionChange();
  
  setupEventListeners();
}

function addRelaunchButton() {
  figma.root.setRelaunchData({ launch: '' });
}

async function loadPluginData() {
  await loadFonts();
  await loadOnboardingData();
  loadCustomStatusesData();
  loadValidNodeTypesData();
  await loadElementIdsToStatusBarIdsData();
}

async function loadOnboardingData() {
  const showOnboarding = await figma.clientStorage.getAsync('show_onboarding');
  pluginState.showOnboarding =
    showOnboarding === undefined ? true : showOnboarding;
}

async function loadFonts() {
  await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
  await figma.loadFontAsync({ family: 'Inter', style: 'Semi Bold' });
}

function loadCustomStatusesData() {
  if (figma.root.getPluginData('custom_statuses')) {
    pluginState.customStatuses = JSON.parse(
      figma.root.getPluginData('custom_statuses')
    );
  }
}

function loadValidNodeTypesData() {
  if (figma.root.getPluginData('valid_node_types')) {
    pluginState.validNodeTypes = JSON.parse(
      figma.root.getPluginData('valid_node_types')
    );
  }
}

async function loadElementIdsToStatusBarIdsData() {
  if (figma.root.getPluginData('element_ids_to_status_bar_ids')) {
    const elementIdsToStatusBarIdsData = JSON.parse(figma.root.getPluginData('element_ids_to_status_bar_ids'))
    for (const [elementId, sttatusBarId] of elementIdsToStatusBarIdsData) {
      pluginState.elementIdsToStatusBarIds.set(elementId, sttatusBarId)
    }
  }
}

function saveElementIdsToStatusBarIdsData() {
  figma.root.setPluginData('element_ids_to_status_bar_ids', JSON.stringify(
    Array.from(pluginState.elementIdsToStatusBarIds.entries())
  ))
}

function createUI() {
  figma.showUI(__html__, { height: 400 });
}

function onSelectionChange() {
  pluginState.validSelection = figma.currentPage.selection.filter((item) =>
    isNodeValid(item)
  );

  sendUIMessage({
    type: 'onSelectionChange',
    data: {
      atLeastOneValidElementSelected: !!pluginState.validSelection.length,
    },
  });
}

async function updateStatusesCount() {
  const statusesCount: any = {};
  for (const element of pluginState.validSelection) {
    
    if (element.getPluginData('status_bar_id')) {
      const statusBarNode = await figma.getNodeByIdAsync(element.getPluginData('status_bar_id'))
      const statusId = statusBarNode?.getPluginData('status_id')
      if (statusId) {
        statusesCount[statusId]
        ? statusesCount[statusId]++
        : (statusesCount[statusId] = 1);
      }
    }
  }
  sendUIMessage({ type: 'updateStatusesCount', data: { statusesCount } });
}

function resetStatusesCount() {
  sendUIMessage({ type: 'updateStatusesCount', data: { statusesCount: {} } });
}

async function onNodeChange(event: NodeChangeEvent) {
  for (const change of event.nodeChanges) {
    const isElementWithStatusChanged = pluginState.elementIdsToStatusBarIds.has(change.node.id)

    if (isElementWithStatusChanged) {
      switch (change.type) {
        case 'PROPERTY_CHANGE':
          const elementNode = change.node as SceneNode;
          const statusBarNode = await figma.getNodeByIdAsync(elementNode.getPluginData('status_bar_id'))
          if (statusBarNode) {
            const isPositionChanged = change.properties.reduce((acc, item) => {
              return acc || item === 'x' || item === 'y';
            }, false);
            const isParentChanged = change.properties.includes('parent');
  
            if (isPositionChanged) {
              changeStatusBarNodePosition(elementNode, statusBarNode as SceneNode);
            }
            if (isParentChanged) {
              changeStatusBarNodeParent(elementNode, statusBarNode as GroupNode);
              onSelectionChange();
            }
          }
          break;
      }
    }
  }
}

function setupEventListeners() {
  figma.ui.onmessage = handleUIMessage;

  figma.on('selectionchange', () => {
    onSelectionChange();
    updateStatusesCount();
  });

  figma.on('close', cleanup);

  figma.currentPage.on('nodechange', (event) => {
    onNodeChange(event);
  });
}

async function handleUIMessage(msg: any) {
  switch (msg.type) {
    case 'closeOnboarding':
      figma.clientStorage.setAsync('show_onboarding', false);
      break;

    case 'setStatus':
      for (const element of pluginState.validSelection) {
        figma.getNodeByIdAsync(element.getPluginData('status_bar_id'))
          .then(currentStatusBarNode => {
            currentStatusBarNode?.remove()
          })

        const status = {
          background: msg.data.background,
          color: msg.data.color,
          icon: msg.data.icon,
          name: msg.data.name,
          id: msg.data.id,
        };

        const userName = figma.currentUser?.name ?? 'Unidentified user';
        const datetime = getFormattedDatetime();

        const statusBarNode = createStatusBar(status, userName, datetime, element.name);

        element.setPluginData('status_bar_id', statusBarNode.id)
        pluginState.elementIdsToStatusBarIds.set(element.id, statusBarNode.id)

        changeStatusBarNodePosition(element, statusBarNode);
        changeStatusBarNodeParent(element, statusBarNode);

      }
      updateStatusesCount();
      break;

    case 'saveCustomStatuses':
      pluginState.customStatuses = msg.data;
      figma.root.setPluginData(
        'custom_statuses',
        JSON.stringify(pluginState.customStatuses)
      );
      break;

    case 'saveValidNodeTypes':
      pluginState.validNodeTypes = msg.data
      figma.root.setPluginData(
        'valid_node_types',
        JSON.stringify(pluginState.validNodeTypes)
      );
      break;

    case 'removeStatuses':
      for (const element of pluginState.validSelection) {
        if (element.getPluginData('status_bar_id')) {
          const statusBarNode = await figma.getNodeByIdAsync(element.getPluginData('status_bar_id'))
          statusBarNode?.remove()
        }
      }
      resetStatusesCount();
      break;

    case 'removeAllStatuses':
      for (const statusBarId of pluginState.elementIdsToStatusBarIds.values()) {
        const statusBarNode = await figma.getNodeByIdAsync(statusBarId)
        statusBarNode?.remove()
      }
      
      resetStatusesCount();
      break;

    case 'update':
      for (const [elementId, statusBarId] of pluginState.elementIdsToStatusBarIds.entries()) {
        figma.getNodeByIdAsync(elementId)
          .then(elementNode => {
            if (elementNode) {
              figma.getNodeByIdAsync(statusBarId)
                .then(statusBarNode => {
                  if (statusBarNode) {
                    changeStatusBarNodePosition(elementNode as SceneNode, statusBarNode as SceneNode);
                    changeStatusBarNodeParent(elementNode as SceneNode, statusBarNode as GroupNode);
                  }
                })
            }
          })
      }
      break;

  }
}

function sendUIMessage(msg: any) {
  figma.ui.postMessage(msg);
}

function cleanup() {
  saveElementIdsToStatusBarIdsData();
}

function createStatusBar(
  status: {
    background: string;
    color: string;
    icon: string;
    name: string;
    id: string;
  },
  userName: string,
  datetime: string,
  elementName: string,
  background: string = '#FFFFFF',
  color: string = '#777777',
  shadow: string = '#7C7C7C26'
): GroupNode {
  const statusBarElement = figma.createFrame();
  statusBarElement.resize(1, 36);
  statusBarElement.fills = [
    { type: 'SOLID', color: figma.util.rgb(background) },
  ];
  const effects: DropShadowEffect[] = [
    {
      type: 'DROP_SHADOW',
      color: figma.util.rgba(shadow),
      offset: { x: 0, y: 2 },
      radius: 15,
      spread: 0,
      visible: true,
      blendMode: 'NORMAL',
    },
  ];
  statusBarElement.effects = effects;
  statusBarElement.layoutMode = 'HORIZONTAL';
  statusBarElement.cornerRadius = 20;
  statusBarElement.counterAxisAlignItems = 'CENTER';
  statusBarElement.itemSpacing = 16;
  statusBarElement.paddingLeft = 16;
  statusBarElement.locked = true;

  const statusTagElement = figma.createFrame();
  statusTagElement.resize(1, 36);
  statusTagElement.fills = [
    { type: 'SOLID', color: figma.util.rgb(status.background) },
  ];
  statusTagElement.layoutMode = 'HORIZONTAL';
  statusTagElement.paddingLeft = 20;
  statusTagElement.paddingRight = 16;
  statusTagElement.paddingTop = 8;
  statusTagElement.paddingBottom = 8;
  statusTagElement.itemSpacing = 8;
  statusTagElement.topLeftRadius = 0;
  statusTagElement.topRightRadius = 0;
  statusTagElement.bottomLeftRadius = 28;
  statusTagElement.bottomRightRadius = 0;

  const iconNode = figma.createNodeFromSvg(status.icon);
  iconNode.resize(20, 20);
  svgFill(iconNode, figma.util.rgb(status.color));

  const statusNameText = figma.createText();
  statusNameText.characters = status.name;
  statusNameText.fontSize = 16;
  statusNameText.fills = [
    { type: 'SOLID', color: figma.util.rgb(status.color) },
  ];
  statusNameText.fontName = { family: 'Inter', style: 'Semi Bold' };

  const userNameText = figma.createText();
  userNameText.characters = userName;
  userNameText.fontSize = 14;
  userNameText.fills = [{ type: 'SOLID', color: figma.util.rgb(color) }];

  const datetimeText = figma.createText();
  datetimeText.characters = datetime;
  datetimeText.fontSize = 14;
  datetimeText.fills = [{ type: 'SOLID', color: figma.util.rgb(color) }];

  statusTagElement.appendChild(iconNode);
  statusTagElement.appendChild(statusNameText);
  statusBarElement.appendChild(userNameText);
  statusBarElement.appendChild(datetimeText);
  statusBarElement.appendChild(statusTagElement);

  const statusBarGroup = figma.group([statusBarElement], figma.currentPage);
  statusBarGroup.name = `Status [${elementName}]`;
  statusBarGroup.expanded = false;
  statusBarGroup.setPluginData('type', 'ELEMENT STATUS');
  statusBarGroup.setPluginData('status_id', status.id);

  return statusBarGroup;
}

function changeStatusBarNodeParent(
  mainNode: SceneNode,
  attachedNode: GroupNode
) {
  mainNode.parent?.insertChild(getNodeIndex(mainNode) + 1, attachedNode);
  changeStatusBarNodeVisibility(attachedNode);
  if (
    (attachedNode.parent?.type === 'COMPONENT' ||
      attachedNode.parent?.type === 'COMPONENT_SET' ||
      attachedNode.parent?.type === 'FRAME' ||
      attachedNode.parent?.type === 'INSTANCE') &&
    attachedNode.parent?.layoutMode !== 'NONE'
  ) {
    attachedNode.layoutPositioning = 'ABSOLUTE';
  }
}

function changeStatusBarNodeVisibility(attachedNode: GroupNode) {
  attachedNode.visible = hasValidParent(attachedNode) ? true : false;
}

function changeStatusBarNodePosition(
  mainNode: SceneNode,
  attachedNode: SceneNode
) {
  attachedNode.x = mainNode.x + mainNode.width - attachedNode.width;
  attachedNode.y = mainNode.y - 60;
}

function isNodeValid(node: SceneNode): boolean {
  return (
    hasValidParent(node) &&
    hasValidType(node, pluginState.validNodeTypes) &&
    node.getPluginData('type') !== 'ELEMENT STATUS'
  );
}

function hasValidParent(node: SceneNode): boolean {
  const isChildOfPage = node.parent?.type === 'PAGE';
  const isChildOfSection = node.parent?.type === 'SECTION';
  const isChildOfComponentSet = node.parent?.type === 'COMPONENT_SET';
  const isChildOfAutolayout =
    (node.parent?.type === 'COMPONENT' ||
      node.parent?.type === 'COMPONENT_SET' ||
      node.parent?.type === 'FRAME' ||
      node.parent?.type === 'INSTANCE') &&
    node.parent?.layoutMode !== 'NONE';
  return isChildOfPage || isChildOfSection || isChildOfComponentSet || isChildOfAutolayout;
}

function hasValidType(
  node: SceneNode,
  validNodeTypes: {
    name: string;
    types: string[];
    enabled: boolean;
  }[]
): boolean {
  const rawValidNodeTypes = validNodeTypes.reduce((acc, item) => {
    if (item.enabled) {
      for (const type of item.types) {
        acc.push(type)
      }
    }
    return acc
  }, [] as string[])
  console.log(node.type, rawValidNodeTypes)
  if (!figma.root.getPluginData('valid_node_types')) return true
  return rawValidNodeTypes.indexOf(node.type) !== -1;
}

function svgFill(node: SceneNode, color: RGB) {
  if (node.type === 'VECTOR') {
    node.fills = [{ type: 'SOLID', color }];
  } else if (
    node.type === 'BOOLEAN_OPERATION' ||
    node.type === 'COMPONENT' ||
    node.type === 'COMPONENT_SET' ||
    node.type === 'FRAME' ||
    node.type === 'GROUP' ||
    node.type === 'INSTANCE' ||
    node.type === 'SECTION'
  ) {
    for (const child of node.children) {
      svgFill(child, color);
    }
  }
}

function getFormattedDatetime(): string {
  const now = new Date();

  const monthNames: string[] = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  function padZero(number: number): string {
    return number < 10 ? '0' + number : number.toString();
  }

  const day = now.getDate();
  const month = monthNames[now.getMonth()];
  const year = now.getFullYear();
  const hours = padZero(now.getHours());
  const minutes = padZero(now.getMinutes());

  const formattedDate = `${day} ${month} ${year}, ${hours}:${minutes}`;

  return formattedDate;
}

function getNodeIndex(node: SceneNode): number {
  return node.parent?.children.indexOf(node) ?? -1
}