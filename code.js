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
function setSelectionState() {
    let atLeastOneFrameSelected = Boolean(figma.currentPage.selection.reduce((acc, item) => {
        var _a;
        let isElementFrame = item.type === 'FRAME';
        let isElementParentPage = ((_a = item.parent) === null || _a === void 0 ? void 0 : _a.type) === 'PAGE';
        return acc + Number(isElementFrame && isElementParentPage);
    }, 0));
    if (figma.ui)
        figma.ui.postMessage({ type: "setSelectionState", data: { atLeastOneFrameSelected } });
}
figma.clientStorage.getAsync('instructionCompleted')
    .then(result => {
    figma.showUI(__html__, { height: 400 });
    setSelectionState();
    figma.on("selectionchange", () => {
        setSelectionState();
    });
    figma.ui.postMessage({ type: "setInstructionState", data: { instructionCompleted: result } });
    figma.ui.onmessage = (msg) => {
        switch (msg.type) {
            case 'closeInstruction':
                figma.clientStorage.setAsync('instructionCompleted', true);
                break;
            case 'setStatus':
                let selectedFrame = figma.currentPage.selection.find(item => item.type === 'FRAME');
                if (selectedFrame) {
                    (() => __awaiter(void 0, void 0, void 0, function* () {
                        var _a, _b;
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
                        const statusName = figma.createText();
                        const userName = figma.createText();
                        const currentDate = figma.createText();
                        const status = figma.createFrame();
                        const tag = figma.createFrame();
                        const meta = figma.createFrame();
                        const svgStr = '<?xml version="1.0" encoding="utf-8"?> <!-- Generator: Adobe Illustrator 22.0.0, SVG Export Plug-In . SVG Version: 6.00 Build 0)  --> <svg version="1.1" id="lni_lni-bi-cycle" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 64 64" style="enable-background:new 0 0 64 64;" xml:space="preserve"> <g> <path d="M13,36.1c-6.2,0-11.2,5-11.2,11.2s5,11.2,11.2,11.2s11.2-5,11.2-11.2S19.2,36.1,13,36.1z M13,54.1c-3.7,0-6.7-3-6.7-6.7 s3-6.7,6.7-6.7s6.7,3,6.7,6.7S16.7,54.1,13,54.1z"/> <path d="M51.1,36.2c-6.2,0-11.2,5-11.2,11.2s5,11.2,11.2,11.2s11.2-5,11.2-11.2S57.2,36.2,51.1,36.2z M51.1,54 c-3.7,0-6.7-3-6.7-6.7s3-6.7,6.7-6.7s6.7,3,6.7,6.7S54.8,54,51.1,54z"/> <path d="M46.2,30.5c0.8,1,2.2,1.1,3.2,0.4c1-0.8,1.1-2.2,0.4-3.2l-8.5-10.8l-0.2-0.2c-1-1-2.4-1.2-3.6-0.6l-11.6,6.8 c-0.8,0.5-1.4,1.3-1.5,2.2c-0.1,0.9,0.2,1.7,0.8,2.4l3.8,4.4c0.5,0.6,0.8,1.4,0.8,2.3v6.7c0,1.2,1,2.3,2.3,2.3c1.2,0,2.3-1,2.3-2.3 v-6.7c0-1.9-0.7-3.8-1.9-5.2l-2.7-3.1l8.8-5.2L46.2,30.5z"/> <path d="M48.6,17.7c3.4,0,6.1-2.7,6.1-6.1S52,5.4,48.6,5.4c-3.4,0-6.1,2.7-6.1,6.1S45.2,17.7,48.6,17.7z M48.6,9.9 c0.9,0,1.6,0.7,1.6,1.6s-0.7,1.6-1.6,1.6S47,12.5,47,11.6S47.7,9.9,48.6,9.9z"/> </g> </svg>';
                        const svgNode = figma.createNodeFromSvg(svgStr);
                        status.x = selectedFrame.x;
                        status.y = selectedFrame.y - 60;
                        status.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
                        status.resize(300, 36);
                        status.layoutMode = 'HORIZONTAL';
                        status.topLeftRadius = 40;
                        status.topRightRadius = 40;
                        status.bottomLeftRadius = 40;
                        status.bottomRightRadius = 40;
                        tag.resize(200, 36);
                        tag.layoutMode = 'HORIZONTAL';
                        tag.paddingLeft = 16;
                        tag.paddingRight = 24;
                        tag.paddingTop = 8;
                        tag.paddingBottom = 8;
                        tag.topLeftRadius = 40;
                        tag.topRightRadius = 0;
                        tag.bottomLeftRadius = 40;
                        tag.bottomRightRadius = 40;
                        meta.resize(300, 36);
                        meta.layoutMode = 'HORIZONTAL';
                        meta.itemSpacing = 16;
                        meta.paddingLeft = 16;
                        meta.paddingRight = 16;
                        meta.paddingTop = 9.5;
                        meta.paddingBottom = 9.5;
                        tag.fills = [{ type: 'SOLID', color: background }];
                        yield figma.loadFontAsync({ family: "Inter", style: "Regular" });
                        statusName.characters = msg.data.name;
                        userName.characters = (_b = (_a = figma.currentUser) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : 'unidentified user';
                        currentDate.characters = msg.data.currentDate;
                        statusName.fontSize = 16;
                        statusName.fills = [{ type: 'SOLID', color }];
                        userName.fontSize = 14;
                        currentDate.fontSize = 14;
                        userName.fills = [{ type: 'SOLID', color: { r: 119 / 255, g: 120 / 255, b: 124 / 255 } }];
                        currentDate.fills = [{ type: 'SOLID', color: { r: 119 / 255, g: 120 / 255, b: 124 / 255 } }];
                        tag.appendChild(statusName);
                        tag.appendChild(svgNode);
                        meta.appendChild(userName);
                        meta.appendChild(currentDate);
                        status.appendChild(tag);
                        status.appendChild(meta);
                    }))();
                }
                break;
            case '':
                break;
        }
        // if (msg.type === 'create-rectangles') {
        //   const nodes: SceneNode[] = [];
        //   for (let i = 0; i < msg.count; i++) {
        //     const rect = figma.createRectangle();
        //     rect.x = i * 150;
        //     rect.fills = [{type: 'SOLID', color: {r: 1, g: 0.5, b: 0}}];
        //     figma.currentPage.appendChild(rect);
        //     nodes.push(rect);
        //   }
        //   figma.currentPage.selection = nodes;
        //   figma.viewport.scrollAndZoomIntoView(nodes);
        // }
        // figma.closePlugin();
    };
});
