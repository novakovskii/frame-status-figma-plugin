interface PluginState {
  showOnboarding: boolean;
  validNodeTypes: string[];
  validSelection: SceneNode[];
  customStatuses: Status[];
  elementsToStatuses: Map<SceneNode, SceneNode>;
}
if (figma.root.getPluginData('elements_to_statuses')) {
  console.log(1, JSON.parse(figma.root.getPluginData('elements_to_statuses')))
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
  elementsToStatuses: new Map()
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
  await loadElementsToStatusesData();
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

async function loadElementsToStatusesData() {
  if (figma.root.getPluginData('elements_to_statuses')) {
    const elementsToStatusesData = JSON.parse(figma.root.getPluginData('elements_to_statuses'))
    for (const [elementId, statusBarId] of elementsToStatusesData) {
      const elementNode = await figma.getNodeByIdAsync(elementId)
      const statusBarNode = await figma.getNodeByIdAsync(statusBarId)
      if (elementNode && statusBarNode) {
        pluginState.elementsToStatuses.set(elementNode as SceneNode, statusBarNode as SceneNode)
      }
    }
  }
}

function saveElementsToStatusesData() {
  figma.root.setPluginData('elements_to_statuses', JSON.stringify(
    Array.from(pluginState.elementsToStatuses.entries()).map(([element, statusBar]) => [element.id, statusBar.id])
  ));
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
  updateStatusesCount();
}

function updateStatusesCount() {
  const statusesCount: any = {};
  for (const element of pluginState.validSelection) {
    const statusId = getStatusBarNodeByElementNode(element)?.getPluginData('status_id');
    if (statusId) {
      statusesCount[statusId]
      ? statusesCount[statusId]++
      : (statusesCount[statusId] = 1);
    }
  }
  sendUIMessage({ type: 'updateStatusesCount', data: { statusesCount } });
}

function onNodeChange(event: NodeChangeEvent) {
  for (const change of event.nodeChanges) {
    // const isNodeWithStatusChanged = Array.from(pluginState.elements.keys())
    //   .map((item) => item.id)
    //   .includes(change.node.id);

    // if (isNodeWithStatusChanged) {
    //   switch (change.type) {
    //     case 'PROPERTY_CHANGE':
    //       const elementNode = change.node as SceneNode;
    //       const statusBarNode = pluginState.elements.get(elementNode)
    //         ?.node as GroupNode;
    //       const isPositionChanged = change.properties.reduce((acc, item) => {
    //         return acc || item === 'x' || item === 'y';
    //       }, false);
    //       const isParentChanged = change.properties.includes('parent');

    //       if (isPositionChanged) {
    //         changeStatusBarNodePosition(elementNode, statusBarNode);
    //       }
    //       if (isParentChanged) {
    //         changeStatusBarNodeParent(elementNode, statusBarNode);
    //         onSelectionChange();
    //       }
    //       break;
    //   }
    // }
  }
}

function setupEventListeners() {
  figma.ui.onmessage = handleUIMessage;

  figma.on('selectionchange', () => {
    onSelectionChange();
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
        getStatusBarNodeByElementNode(element)?.remove()
        

        const status = {
          background: msg.data.background,
          color: msg.data.color,
          icon: msg.data.icon,
          name: msg.data.name,
          id: msg.data.id,
        };

        const userName = figma.currentUser?.name ?? 'Unidentified user';
        const datetime = getFormattedDatetime();

        const statusBarNode = createStatusBar(status, userName, datetime);

        pluginState.elementsToStatuses.set(element, statusBarNode);
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
      pluginState.validNodeTypes = msg.data;
      figma.root.setPluginData(
        'valid_node_types',
        JSON.stringify(pluginState.validNodeTypes)
      );
      break;

    case 'removeStatuses':
      for (const element of pluginState.validSelection) {
        getStatusBarNodeByElementNode(element)?.remove()
      }
      updateStatusesCount();
      break;

    case 'removeAllStatuses':
      for (const element of pluginState.elementsToStatuses.keys()) {
        getStatusBarNodeByElementNode(element)?.remove()
      }
      updateStatusesCount();
      break;

  }
}

function sendUIMessage(msg: any) {
  figma.ui.postMessage(msg);
}

function cleanup() {
  saveElementsToStatusesData();
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
  statusBarGroup.name = 'Status';
  statusBarGroup.expanded = false;
  statusBarGroup.setPluginData('type', 'ELEMENT STATUS');
  statusBarGroup.setPluginData('status_id', status.id);

  return statusBarGroup;
}

function changeStatusBarNodeParent(
  mainNode: SceneNode,
  attachedNode: GroupNode
) {
  mainNode.parent?.appendChild(attachedNode);
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
  const isChildOfAutolayout =
    (node.parent?.type === 'COMPONENT' ||
      node.parent?.type === 'COMPONENT_SET' ||
      node.parent?.type === 'FRAME' ||
      node.parent?.type === 'INSTANCE') &&
    node.parent?.layoutMode !== 'NONE';
  return isChildOfPage || isChildOfSection || isChildOfAutolayout;
}

function hasValidType(
  node: SceneNode,
  validNodeTypes: string[] | string
): boolean {
  if (validNodeTypes.length === 0) return true;
  else return validNodeTypes.indexOf(node.type) !== -1;
}

function isNodeExist(node: BaseNode): boolean {
  return node.removed === false;
}

function isNodePairExist(node1: BaseNode, node2: BaseNode): boolean {
  return isNodeExist(node1) && isNodeExist(node2);
}

function getStatusBarNodeByElementNode(element: SceneNode): SceneNode | null {
  if (pluginState.elementsToStatuses.has(element)) {
    const statusBarNode = pluginState.elementsToStatuses.get(element)
    if (statusBarNode && isNodeExist(statusBarNode)) {
      return statusBarNode
    } else {
      return null
    }
  } else {
    return null
  }
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
