"use strict";
const pluginState = {
    showOnboarding: true,
    validNodeTypes: [],
    validSelection: [],
    customStatuses: [],
    elements: new Map(),
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
    updateStatusesCount();
    setupEventListeners();
}
function addRelaunchButton() {
    figma.root.setRelaunchData({ launch: '' });
}
async function loadPluginData() {
    await loadOnboardingData();
    await loadElementsData();
    await loadFonts();
    loadCustomStatusesData();
}
async function loadOnboardingData() {
    const showOnboarding = await figma.clientStorage.getAsync('show_onboarding');
    pluginState.showOnboarding =
        showOnboarding === undefined ? true : showOnboarding;
}
async function loadElementsData() {
    if (figma.root.getPluginData('elements')) {
        const elementsData = JSON.parse(figma.root.getPluginData('elements'));
        console.log('elementsData', elementsData);
        for (const elementId in elementsData) {
            const elementNode = await figma.getNodeByIdAsync(elementId);
            if (elementNode) {
                const { statusBarId, status, userName, datetime } = elementsData[elementId];
                let statusBarNode = await figma.getNodeByIdAsync(statusBarId);
                if (statusBarNode === null) {
                    statusBarNode = createStatusBar(status, userName, datetime);
                }
                pluginState.elements.set(elementNode, {
                    node: statusBarNode,
                    status,
                    userName,
                    datetime,
                });
            }
        }
    }
}
async function loadFonts() {
    await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
    await figma.loadFontAsync({ family: 'Inter', style: 'Semi Bold' });
}
function loadCustomStatusesData() {
    if (figma.root.getPluginData('custom_statuses')) {
        pluginState.customStatuses = JSON.parse(figma.root.getPluginData('custom_statuses'));
    }
}
function saveElementsData() {
    figma.root.setPluginData('elements', JSON.stringify(Object.fromEntries(Array.from(pluginState.elements.entries()).map(([key, value]) => {
        var _a, _b;
        return [
            key.id,
            {
                statusBarId: (_b = (_a = value.node) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : null,
                status: value.status,
                userName: value.userName,
                datetime: value.datetime,
            },
        ];
    }))));
}
function createUI() {
    figma.showUI(__html__, { height: 400 });
}
function onSelectionChange() {
    pluginState.validSelection = figma.currentPage.selection.filter((item) => isNodeValid(item));
    sendUIMessage({
        type: 'onSelectionChange',
        data: { atLeastOneValidElementSelected: !!pluginState.validSelection.length },
    });
}
function updateStatusesCount() {
    var _a;
    const statusesCount = {};
    for (const element of pluginState.validSelection) {
        if (pluginState.elements.has(element)) {
            const statusId = (_a = pluginState.elements.get(element)) === null || _a === void 0 ? void 0 : _a.status.id;
            if (statusId === undefined)
                continue;
            statusesCount[statusId]
                ? statusesCount[statusId]++
                : (statusesCount[statusId] = 1);
        }
    }
    sendUIMessage({ type: 'updateStatusesCount', data: { statusesCount } });
}
function onNodeChange(event) {
    for (const change of event.nodeChanges) {
        const isNodeWithStatusChanged = Array.from(pluginState.elements.keys())
            .map((item) => item.id)
            .includes(change.node.id);
        const isStatusBarChanged = Array.from(pluginState.elements.values())
            .map((item) => item.node.id)
            .includes(change.node.id);
        if (isNodeWithStatusChanged) {
            switch (change.type) {
                case 'PROPERTY_CHANGE':
                    const isPositionChanged = change.properties.reduce((acc, item) => {
                        return acc || item === 'x' || item === 'y';
                    }, false);
                    const isParentChanged = change.properties.includes('parent');
                    if (isPositionChanged) {
                        // changeStatusBarNodePosition();
                    }
                    if (isParentChanged) {
                        // changeStatusBarNodeParent();
                        // onSelectionChange();
                    }
                    break;
                case 'DELETE':
                    // remove statusBar
                    // remove node from plugin state Map
                    break;
            }
        }
        else if (isStatusBarChanged) {
            switch (change.type) {
                case 'PROPERTY_CHANGE':
                    // position statusBar back
                    break;
                case 'DELETE':
                    // create statusBar back
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
async function handleUIMessage(msg) {
    var _a, _b, _c, _d, _e, _f, _g;
    switch (msg.type) {
        case 'closeOnboarding':
            figma.clientStorage.setAsync('show_onboarding', false);
            break;
        case 'setStatus':
            for (const element of pluginState.validSelection) {
                if (pluginState.elements.has(element)) {
                    (_a = pluginState.elements.get(element)) === null || _a === void 0 ? void 0 : _a.node.remove();
                }
                const status = {
                    background: msg.data.background,
                    color: msg.data.color,
                    icon: msg.data.icon,
                    name: msg.data.name,
                    id: msg.data.id,
                };
                const userName = (_c = (_b = figma.currentUser) === null || _b === void 0 ? void 0 : _b.name) !== null && _c !== void 0 ? _c : 'Unidentified user';
                const datetime = getFormattedDatetime();
                const statusBarGroup = createStatusBar(status, userName, datetime);
                changeStatusBarNodePosition(element, statusBarGroup);
                changeStatusBarNodeParent(element, statusBarGroup);
                pluginState.elements.set(element, {
                    node: statusBarGroup,
                    status: status,
                    userName: userName,
                    datetime: datetime,
                });
                saveElementsData();
            }
            updateStatusesCount();
            break;
        case 'saveCustomStatuses':
            pluginState.customStatuses = msg.data;
            figma.root.setPluginData('custom_statuses', JSON.stringify(pluginState.customStatuses));
            break;
        case 'removeStatuses':
            for (const element of pluginState.validSelection) {
                if (pluginState.elements.has(element)) {
                    (_d = pluginState.elements.get(element)) === null || _d === void 0 ? void 0 : _d.node.remove();
                    pluginState.elements.delete(element);
                    updateStatusesCount();
                    saveElementsData();
                }
            }
            break;
        case 'removeAllStatuses':
            for (const element of pluginState.elements.keys()) {
                (_e = pluginState.elements.get(element)) === null || _e === void 0 ? void 0 : _e.node.remove();
                pluginState.elements.delete(element);
                updateStatusesCount();
                saveElementsData();
            }
            break;
        case 'removeCustomStatus':
            const elementsWithRemovingStatus = new Map();
            for (const [element, statusBar] of pluginState.elements.entries()) {
                if (statusBar.status.id === msg.data.id) {
                    elementsWithRemovingStatus.set(element, statusBar);
                }
            }
            if (!elementsWithRemovingStatus.size) {
                sendUIMessage({
                    type: 'removeCustomStatus',
                    data: { id: msg.data.id },
                });
                return;
            }
            if (msg.data.force) {
                sendUIMessage({
                    type: 'removeCustomStatus',
                    data: { id: msg.data.id },
                });
                for (const element of elementsWithRemovingStatus.keys()) {
                    (_f = pluginState.elements.get(element)) === null || _f === void 0 ? void 0 : _f.node.remove();
                    pluginState.elements.delete(element);
                    updateStatusesCount();
                    saveElementsData();
                }
                return;
            }
            sendUIMessage({
                type: 'sendElementsWithRemovingStatus',
                data: Array.from(elementsWithRemovingStatus.keys()).map((item) => {
                    return {
                        id: item.id,
                        name: item.name,
                    };
                }),
            });
            break;
        case 'goToElement':
            const element = Array.from(pluginState.elements.keys()).find((item) => item.id === msg.data.id);
            if (element === undefined)
                return;
            const nodePage = getNodePage(element);
            if (nodePage.id !== figma.currentPage.id) {
                figma.setCurrentPageAsync(nodePage).then(() => {
                    figma.viewport.scrollAndZoomIntoView([element]);
                    figma.currentPage.selection = [element];
                });
            }
            else {
                figma.viewport.scrollAndZoomIntoView([element]);
                figma.currentPage.selection = [element];
            }
            break;
        case 'update':
            for (const [element, statusBar] of pluginState.elements.entries()) {
                if (statusBar.node) {
                    // positionStatusBarGroup(statusBar.node, element);
                }
                else {
                    const statusBarGroup = createStatusBar(statusBar.status, statusBar.userName, statusBar.datetime);
                    // positionStatusBarGroup(statusBarGroup, element);
                    let statusBarNode = (_g = pluginState.elements.get(element)) === null || _g === void 0 ? void 0 : _g.node;
                    if (!statusBarNode)
                        return;
                    statusBarNode = statusBarGroup;
                    saveElementsData();
                }
            }
            break;
    }
}
function sendUIMessage(msg) {
    figma.ui.postMessage(msg);
}
function cleanup() {
    // console.log('Plugin closed');
}
function createStatusBar(status, userName, datetime, background = '#FFFFFF', color = '#777777', shadow = '#7C7C7C26') {
    const statusBarElement = figma.createFrame();
    statusBarElement.resize(1, 36);
    statusBarElement.fills = [{ type: 'SOLID', color: figma.util.rgb(background) }];
    const effects = [
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
    return statusBarGroup;
}
function changeStatusBarNodeParent(mainNode, attachedNode) {
    var _a, _b, _c, _d, _e, _f;
    (_a = mainNode.parent) === null || _a === void 0 ? void 0 : _a.appendChild(attachedNode);
    changeStatusBarNodeVisibility(attachedNode);
    if ((((_b = attachedNode.parent) === null || _b === void 0 ? void 0 : _b.type) === 'COMPONENT' ||
        ((_c = attachedNode.parent) === null || _c === void 0 ? void 0 : _c.type) === 'COMPONENT_SET' ||
        ((_d = attachedNode.parent) === null || _d === void 0 ? void 0 : _d.type) === 'FRAME' ||
        ((_e = attachedNode.parent) === null || _e === void 0 ? void 0 : _e.type) === 'INSTANCE') &&
        ((_f = attachedNode.parent) === null || _f === void 0 ? void 0 : _f.layoutMode) !== 'NONE') {
        attachedNode.layoutPositioning = 'ABSOLUTE';
    }
}
function changeStatusBarNodeVisibility(attachedNode) {
    attachedNode.visible = hasValidParent(attachedNode) ? true : false;
}
function changeStatusBarNodePosition(mainNode, attachedNode) {
    attachedNode.x = mainNode.x + mainNode.width - attachedNode.width;
    attachedNode.y = mainNode.y - 60;
}
function isNodeValid(node) {
    return hasValidParent(node) && hasValidType(node, pluginState.validNodeTypes) && node.getPluginData('type') !== 'ELEMENT STATUS';
}
function hasValidParent(node) {
    var _a, _b, _c, _d, _e, _f, _g;
    const isChildOfPage = ((_a = node.parent) === null || _a === void 0 ? void 0 : _a.type) === 'PAGE';
    const isChildOfSection = ((_b = node.parent) === null || _b === void 0 ? void 0 : _b.type) === 'SECTION';
    const isChildOfAutolayout = (((_c = node.parent) === null || _c === void 0 ? void 0 : _c.type) === 'COMPONENT' ||
        ((_d = node.parent) === null || _d === void 0 ? void 0 : _d.type) === 'COMPONENT_SET' ||
        ((_e = node.parent) === null || _e === void 0 ? void 0 : _e.type) === 'FRAME' ||
        ((_f = node.parent) === null || _f === void 0 ? void 0 : _f.type) === 'INSTANCE') &&
        ((_g = node.parent) === null || _g === void 0 ? void 0 : _g.layoutMode) !== 'NONE';
    return isChildOfPage || isChildOfSection || isChildOfAutolayout;
}
function hasValidType(node, validNodeTypes) {
    if (validNodeTypes.length === 0)
        return true;
    else
        return validNodeTypes.indexOf(node.type) !== -1;
}
function getNodePage(node) {
    var _a;
    if (((_a = node.parent) === null || _a === void 0 ? void 0 : _a.type) === 'PAGE')
        return node.parent;
    else
        return getNodePage(node.parent);
}
function svgFill(node, color) {
    if (node.type === 'VECTOR') {
        node.fills = [{ type: 'SOLID', color }];
    }
    else if (node.type === 'BOOLEAN_OPERATION' ||
        node.type === 'COMPONENT' ||
        node.type === 'COMPONENT_SET' ||
        node.type === 'FRAME' ||
        node.type === 'GROUP' ||
        node.type === 'INSTANCE' ||
        node.type === 'SECTION') {
        for (const child of node.children) {
            svgFill(child, color);
        }
    }
}
function getFormattedDatetime() {
    const now = new Date();
    const monthNames = [
        "January", "February", "March", "April", "May", "June", "July",
        "August", "September", "October", "November", "December"
    ];
    function padZero(number) {
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
