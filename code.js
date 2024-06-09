"use strict";
const pluginState = {
    selectedFrames: [],
    customStatuses: [],
    frames: new Map(),
};
async function loadPluginData() {
    await loadFramesData();
    loadCustomStatusesData();
}
async function loadFramesData() {
    if (figma.root.getPluginData('frames')) {
        const framesData = JSON.parse(figma.root.getPluginData('frames'));
        for (const key in framesData) {
            const frameNode = await figma.getNodeByIdAsync(key);
            const statusBarNode = await figma.getNodeByIdAsync(framesData[key].statusBarId);
            pluginState.frames.set(frameNode, {
                statusBarNode,
                status: framesData[key].status,
                userName: framesData[key].userName,
                datetime: framesData[key].datetime,
            });
        }
    }
}
function loadCustomStatusesData() {
    if (figma.root.getPluginData('custom_statuses')) {
        pluginState.customStatuses = JSON.parse(figma.root.getPluginData('custom_statuses'));
    }
}
function saveFramesData() {
    figma.root.setPluginData('frames', JSON.stringify(Object.fromEntries(Array.from(pluginState.frames.entries()).map(([key, value]) => {
        return [
            key.id,
            {
                statusBarId: value.statusBarNode.id,
                status: value.status,
                userName: value.userName,
                datetime: value.datetime,
            },
        ];
    }))));
}
function loadOnboardingData() {
    return figma.clientStorage.getAsync('instruction_completed');
}
function createUI() {
    figma.showUI(__html__, { height: 400 });
}
async function handleUIMessage(msg) {
    var _a, _b;
    switch (msg.type) {
        case 'completeInstruction':
            figma.clientStorage.setAsync('instruction_completed', true);
            break;
        case 'setStatus':
            for (const frame of pluginState.selectedFrames) {
                if (pluginState.frames.has(frame)) {
                    pluginState.frames.get(frame).statusBarNode.remove();
                }
                const status = {
                    background: hexToRgb(msg.data.background),
                    color: hexToRgb(msg.data.color),
                    icon: msg.data.icon,
                    name: msg.data.name,
                    id: msg.data.id,
                };
                const userName = (_b = (_a = figma.currentUser) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : 'Unidentified user';
                const currentDate = msg.data.currentDate;
                await createStatusBar(status, userName, currentDate).then((statusBarGroup) => {
                    positionStatusBarGroup(statusBarGroup, frame);
                    pluginState.frames.set(frame, {
                        statusBarNode: statusBarGroup,
                        status: status,
                        userName: userName,
                        datetime: currentDate,
                    });
                    saveFramesData();
                });
            }
            updateStatusesCount();
            break;
        case 'saveCustomStatuses':
            pluginState.customStatuses = msg.data;
            figma.root.setPluginData('custom_statuses', JSON.stringify(pluginState.customStatuses));
            break;
        case 'removeStatuses':
            for (const frame of pluginState.selectedFrames) {
                if (pluginState.frames.has(frame)) {
                    pluginState.frames.get(frame).statusBarNode.remove();
                    pluginState.frames.delete(frame);
                    updateStatusesCount();
                    saveFramesData();
                }
            }
            break;
        case 'removeAllStatuses':
            for (const frame of pluginState.frames.keys()) {
                pluginState.frames.get(frame).statusBarNode.remove();
                pluginState.frames.delete(frame);
                updateStatusesCount();
                saveFramesData();
            }
            break;
        case 'removeCustomStatus':
            const framesWithRemovingStatus = new Map();
            for (const [frame, statusBar] of pluginState.frames.entries()) {
                if (statusBar.status.id === msg.data.id) {
                    framesWithRemovingStatus.set(frame, statusBar);
                }
            }
            if (!framesWithRemovingStatus.size) {
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
                for (const frame of framesWithRemovingStatus.keys()) {
                    pluginState.frames.get(frame).statusBarNode.remove();
                    pluginState.frames.delete(frame);
                    updateStatusesCount();
                    saveFramesData();
                }
                return;
            }
            sendUIMessage({
                type: 'sendFramesWithRemovingStatus',
                data: Array.from(framesWithRemovingStatus.keys()).map((item) => {
                    return {
                        id: item.id,
                        name: item.name,
                    };
                }),
            });
            break;
        case 'goToFrame':
            const frame = Array.from(pluginState.frames.keys()).find((item) => item.id === msg.data.id);
            if (frame.parent.id !== figma.currentPage.id) {
                figma.setCurrentPageAsync(frame.parent).then(() => {
                    figma.viewport.scrollAndZoomIntoView([frame]);
                    figma.currentPage.selection = [frame];
                });
            }
            else {
                figma.viewport.scrollAndZoomIntoView([frame]);
                figma.currentPage.selection = [frame];
            }
            break;
        case 'update':
            for (const [frame, statusBar] of pluginState.frames.entries()) {
                if (statusBar.statusBarNode) {
                    positionStatusBarGroup(statusBar.statusBarNode, frame);
                }
                else {
                    createStatusBar(statusBar.status, statusBar.userName, statusBar.datetime).then((statusBarGroup) => {
                        positionStatusBarGroup(statusBarGroup, frame);
                        pluginState.frames.get(frame).statusBarNode = statusBarGroup;
                        saveFramesData();
                    });
                }
            }
            break;
    }
}
function sendUIMessage(msg) {
    figma.ui.postMessage(msg);
}
function updateStatusesCount() {
    const statusesCount = {};
    for (const frame of pluginState.selectedFrames) {
        if (pluginState.frames.has(frame)) {
            let statusId = pluginState.frames.get(frame).status.id;
            statusesCount[statusId]
                ? statusesCount[statusId]++
                : (statusesCount[statusId] = 1);
        }
    }
    sendUIMessage({ type: 'updateStatusesCount', data: { statusesCount } });
}
function onSelectionChange() {
    pluginState.selectedFrames = [];
    for (const selectoin of figma.currentPage.selection) {
        if (isNodeRootFrame(selectoin))
            pluginState.selectedFrames.push(selectoin);
    }
    sendUIMessage({
        type: 'onSelectionChange',
        data: { atLeastOneRootFrameSelected: !!pluginState.selectedFrames.length },
    });
}
function isNodeRootFrame(node) {
    var _a, _b;
    const isFrame = node.type === 'FRAME';
    const isChildOfPage = ((_a = node.parent) === null || _a === void 0 ? void 0 : _a.type) === 'PAGE';
    const isChildOfSection = ((_b = node.parent) === null || _b === void 0 ? void 0 : _b.type) === 'SECTION';
    return isFrame && (isChildOfPage || isChildOfSection);
}
function setupEventListeners() {
    figma.ui.onmessage = handleUIMessage;
    figma.on('selectionchange', () => {
        onSelectionChange();
        updateStatusesCount();
    });
    figma.on('close', cleanup);
    figma.currentPage.on('nodechange', (event) => {
        for (const change of event.nodeChanges) {
            const isFrameChanged = Array.from(pluginState.frames.keys())
                .map((item) => item.id)
                .includes(change.node.id);
            const isStatusBarChanged = Array.from(pluginState.frames.values())
                .map((item) => { var _a; return (_a = item.statusBarNode) === null || _a === void 0 ? void 0 : _a.id; })
                .includes(change.node.id);
            if (change.type === 'PROPERTY_CHANGE' && isFrameChanged) {
                const isFrameMoved = change.properties.reduce((acc, item) => {
                    return acc || item === 'x' || item === 'y';
                }, false);
                if (isFrameMoved) {
                    const statusBarNode = pluginState.frames.get(change.node).statusBarNode;
                    if (statusBarNode) {
                        if ('x' in change.node && 'y' in change.node) {
                            positionStatusBarGroup(statusBarNode, change.node);
                        }
                    }
                }
            }
            else if (change.type === 'DELETE') {
                if (isFrameChanged) {
                    const frame = Array.from(pluginState.frames.keys()).find((item) => item.id === change.node.id);
                    const statusBarNode = pluginState.frames.get(frame).statusBarNode;
                    if (statusBarNode)
                        statusBarNode.remove();
                    pluginState.frames.delete(frame);
                }
                else if (isStatusBarChanged) {
                    Array.from(pluginState.frames.values()).find((item) => item.statusBarNode.id === change.node.id).statusBarNode = null;
                }
            }
        }
    });
}
async function initializePlugin() {
    figma.root.setRelaunchData({ launch: "" });
    await loadPluginData();
    const onboardingData = await loadOnboardingData();
    createUI();
    sendUIMessage({
        type: 'setInstructionState',
        data: { instruction_completed: onboardingData },
    });
    sendUIMessage({
        type: 'sendCustomStatuses',
        data: pluginState.customStatuses,
    });
    onSelectionChange();
    updateStatusesCount();
    setupEventListeners();
}
function cleanup() {
    console.log('Plugin closed');
}
async function createStatusBar(status, userName, currentDatetime, background = '#FFFFFF', color = '#777777') {
    await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
    await figma.loadFontAsync({ family: 'Inter', style: 'Semi Bold' });
    const statusBarNode = figma.createFrame();
    statusBarNode.resize(1, 36);
    statusBarNode.fills = [{ type: 'SOLID', color: hexToRgb(background) }];
    statusBarNode.layoutMode = 'HORIZONTAL';
    statusBarNode.cornerRadius = 20;
    statusBarNode.counterAxisAlignItems = 'CENTER';
    statusBarNode.itemSpacing = 16;
    statusBarNode.paddingLeft = 16;
    statusBarNode.locked = true;
    const statusTagNode = figma.createFrame();
    statusTagNode.resize(1, 36);
    statusTagNode.fills = [{ type: 'SOLID', color: status.background }];
    statusTagNode.layoutMode = 'HORIZONTAL';
    statusTagNode.paddingLeft = 20;
    statusTagNode.paddingRight = 16;
    statusTagNode.paddingTop = 8;
    statusTagNode.paddingBottom = 8;
    statusTagNode.itemSpacing = 8;
    statusTagNode.topLeftRadius = 0;
    statusTagNode.topRightRadius = 0;
    statusTagNode.bottomLeftRadius = 28;
    statusTagNode.bottomRightRadius = 0;
    const iconNode = figma.createNodeFromSvg(status.icon);
    iconNode.resize(20, 20);
    svgFill(iconNode, status.color);
    const statusNameNode = figma.createText();
    statusNameNode.characters = status.name;
    statusNameNode.fontSize = 16;
    statusNameNode.fills = [{ type: 'SOLID', color: status.color }];
    statusNameNode.fontName = { family: 'Inter', style: 'Semi Bold' };
    const userNameNode = figma.createText();
    userNameNode.characters = userName;
    userNameNode.fontSize = 14;
    userNameNode.fills = [{ type: 'SOLID', color: hexToRgb(color) }];
    const currentDatetimeNode = figma.createText();
    currentDatetimeNode.characters = currentDatetime;
    currentDatetimeNode.fontSize = 14;
    currentDatetimeNode.fills = [{ type: 'SOLID', color: hexToRgb(color) }];
    statusTagNode.appendChild(iconNode);
    statusTagNode.appendChild(statusNameNode);
    statusBarNode.appendChild(userNameNode);
    statusBarNode.appendChild(currentDatetimeNode);
    statusBarNode.appendChild(statusTagNode);
    const statusBarGroup = figma.group([statusBarNode], figma.currentPage);
    statusBarGroup.name = 'Status';
    statusBarGroup.expanded = false;
    return statusBarGroup;
}
function positionStatusBarGroup(statusBarGroup, frame) {
    var _a;
    const parent = frame.parent;
    if (parent && ((_a = statusBarGroup.parent) === null || _a === void 0 ? void 0 : _a.id) !== parent.id) {
        if ('appendChild' in parent) {
            parent.appendChild(statusBarGroup);
        }
    }
    statusBarGroup.x = frame.x + frame.width - statusBarGroup.width;
    statusBarGroup.y = frame.y - 60;
}
function svgFill(node, color) {
    if (node.type === 'VECTOR') {
        node.fills = [{ type: 'SOLID', color }];
    }
    if ('children' in node) {
        for (const child of node.children) {
            svgFill(child, color);
        }
    }
}
function hexToRgb(hex) {
    hex = hex.replace(/^#/, '');
    let bigint;
    if (hex.length === 3) {
        bigint = parseInt(hex
            .split('')
            .map((c) => c + c)
            .join(''), 16);
    }
    else if (hex.length === 6) {
        bigint = parseInt(hex, 16);
    }
    else {
        throw new Error('Invalid hex color');
    }
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return {
        r: r / 255,
        g: g / 255,
        b: b / 255,
    };
}
initializePlugin();
