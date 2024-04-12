"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
let selectedFrames;
let frames_with_statuses;
let frames_with_statuses_str = figma.currentPage.getPluginData('frames_with_statuses');
if (!frames_with_statuses_str.length) {
    frames_with_statuses = {};
    figma.currentPage.setPluginData('frames_withStatuses', JSON.stringify(frames_with_statuses));
}
else {
    frames_with_statuses = JSON.parse(frames_with_statuses_str);
}
function setSelectionState() {
    selectedFrames = [];
    let atLeastOneFrameSelected = Boolean(figma.currentPage.selection.reduce((acc, item) => {
        var _a;
        let isElementFrame = item.type === 'FRAME';
        let isElementParentPage = ((_a = item.parent) === null || _a === void 0 ? void 0 : _a.type) === 'PAGE';
        if (isElementFrame && isElementParentPage)
            selectedFrames.push(item);
        return acc + Number(isElementFrame && isElementParentPage);
    }, 0));
    if (figma.ui)
        figma.ui.postMessage({ type: "setSelectionState", data: { atLeastOneFrameSelected } });
}
figma.currentPage.on("nodechange", (event) => {
    for (let change of event.nodeChanges) {
        if (!frames_with_statuses[change.id] || change.type !== 'PROPERTY_CHANGE')
            return;
        let isFrameMoved = Boolean(change.properties.reduce((acc, item) => {
            return acc + Number(item === 'x' || item === 'y');
        }, 0));
        if (isFrameMoved) {
            figma.getNodeByIdAsync(frames_with_statuses[change.id].status_bar_id)
                .then(node => {
                if (node && 'x' in node && 'y' in node && 'x' in change.node && 'y' in change.node) {
                    node.x = change.node.x + change.node.width - node.width;
                    node.y = change.node.y - 60;
                }
            });
        }
    }
});
figma.clientStorage.getAsync('instruction_completed')
    .then(result => {
    figma.showUI(__html__, { height: 400 });
    setSelectionState();
    figma.on("selectionchange", () => {
        setSelectionState();
    });
    figma.ui.postMessage({ type: "setInstructionState", data: { instruction_completed: result } });
    figma.ui.onmessage = (msg) => {
        switch (msg.type) {
            case 'completeInstruction':
                figma.clientStorage.setAsync('instruction_completed', true);
                break;
            case 'setStatus':
                let savedSelectedFrames = selectedFrames;
                selectedFrames.forEach(frame => {
                    (() => __awaiter(void 0, void 0, void 0, function* () {
                        var _a, _b, _c;
                        yield figma.loadFontAsync({ family: "Inter", style: "Regular" });
                        yield figma.loadFontAsync({ family: "Inter", style: "Semi Bold" });
                        let background = {
                            r: parseInt(msg.data.background.slice(1, 3), 16) / 255,
                            g: parseInt(msg.data.background.slice(3, 5), 16) / 255,
                            b: parseInt(msg.data.background.slice(5, 7), 16) / 255
                        };
                        let color = {
                            r: parseInt(msg.data.color.slice(1, 3), 16) / 255,
                            g: parseInt(msg.data.color.slice(3, 5), 16) / 255,
                            b: parseInt(msg.data.color.slice(5, 7), 16) / 255
                        };
                        function svgFill(node, color) {
                            if (node.type === "VECTOR") {
                                node.fills = [{ type: 'SOLID', color }];
                            }
                            if (node.children) {
                                node.children.forEach((n) => svgFill(n, color));
                            }
                        }
                        let existingStatusBarId = (_a = frames_with_statuses[frame.id]) === null || _a === void 0 ? void 0 : _a.status_bar_id;
                        if (existingStatusBarId !== undefined) {
                            figma.getNodeByIdAsync(existingStatusBarId)
                                .then(node => {
                                if (node)
                                    node.remove();
                            });
                        }
                        const statusBar = figma.createFrame();
                        statusBar.resize(1, 36);
                        statusBar.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
                        statusBar.layoutMode = 'HORIZONTAL';
                        statusBar.topLeftRadius = 40;
                        statusBar.topRightRadius = 40;
                        statusBar.bottomLeftRadius = 40;
                        statusBar.bottomRightRadius = 40;
                        statusBar.counterAxisAlignItems = 'CENTER';
                        statusBar.itemSpacing = 16;
                        statusBar.paddingRight = 16;
                        statusBar.locked = true;
                        const statusTag = figma.createFrame();
                        statusTag.resize(1, 36);
                        statusTag.fills = [{ type: 'SOLID', color: background }];
                        statusTag.layoutMode = 'HORIZONTAL';
                        statusTag.paddingLeft = 16;
                        statusTag.paddingRight = 24;
                        statusTag.paddingTop = 8;
                        statusTag.paddingBottom = 8;
                        statusTag.itemSpacing = 8;
                        statusTag.topLeftRadius = 40;
                        statusTag.topRightRadius = 0;
                        statusTag.bottomLeftRadius = 40;
                        statusTag.bottomRightRadius = 40;
                        const iconContent = msg.data.icon;
                        const icon = figma.createNodeFromSvg(iconContent);
                        icon.resize(20, 20);
                        svgFill(icon, color);
                        const statusName = figma.createText();
                        statusName.characters = msg.data.name;
                        statusName.fontSize = 16;
                        statusName.fills = [{ type: 'SOLID', color }];
                        statusName.fontName = { family: "Inter", style: "Semi Bold" };
                        const userNameNode = figma.createText();
                        const userName = (_c = (_b = figma.currentUser) === null || _b === void 0 ? void 0 : _b.name) !== null && _c !== void 0 ? _c : 'unidentified user';
                        userNameNode.characters = userName;
                        userNameNode.fontSize = 14;
                        userNameNode.fills = [{ type: 'SOLID', color: { r: 119 / 255, g: 120 / 255, b: 124 / 255 } }];
                        const currentDate = figma.createText();
                        currentDate.characters = msg.data.currentDate;
                        currentDate.fontSize = 14;
                        currentDate.fills = [{ type: 'SOLID', color: { r: 119 / 255, g: 120 / 255, b: 124 / 255 } }];
                        statusTag.appendChild(icon);
                        statusTag.appendChild(statusName);
                        statusBar.appendChild(statusTag);
                        statusBar.appendChild(userNameNode);
                        statusBar.appendChild(currentDate);
                        const group = figma.group([statusBar], figma.currentPage);
                        group.expanded = false;
                        group.x = frame.x + frame.width - group.width;
                        group.y = frame.y - 60;
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
                        };
                        figma.currentPage.setPluginData('frames_with_statuses', JSON.stringify(frames_with_statuses));
                    }))();
                });
                figma.currentPage.selection = savedSelectedFrames;
                break;
            case '':
                break;
        }
    };
});
