figma.showUI(__html__);

figma.ui.resize(280, 480);


figma.ui.onmessage = (message) => {

if(message === "generate-icon") {
    for (const node of figma.currentPage.selection) {

    console.log(node.children)

    for (const child of node.children) {
      if(child.type === "INSTANCE" && child.name === ".icon_template") {
        child.remove();
      } else {
        child.name = "outlinedVector"
      }
    }

    //Flatten vector
    figma.flatten(node.children, node);


    //Save variables of current selections name and location on the page
    const x = node.x;
    const y = node.y;
    const name = node.name;

    //Duplicates current selection & creates a component
    const component = figma.createComponent()
    component.resizeWithoutConstraints(node.width, node.height)
    for (const child of node.children) {
      component.appendChild(child)
      component.x = x;
      component.y = y;
      component.name = name;
    }

    //in order to create a component set with 2 variants we need to clone the component
    const componentClone = component.clone();

    //sets the selection to the newly created components
    figma.currentPage.selection = [component, componentClone];

    //combines them as a variant
    figma.combineAsVariants(figma.currentPage.selection, figma.currentPage)

    //removes the initally selected icon frame
    node.remove();

    //creates references to the two variants
    const mdVariant = figma.currentPage.selection[0];
    const smVariant = figma.currentPage.selection[1];

    //medium size icon
    mdVariant.name = "size=medium"
    mdVariant.children[0].name = "vector"

    //small size icon
    smVariant.name = "size=small"
    smVariant.children[0].name = "vector"
    smVariant.resize(16, 16);

    //Overengineered bullshit in order to add a stroke, since the original strokes array is read-only
    const strokeObj = {
      blendMode: "NORMAL",
      color: {r: 0, g: 0, b: 0},
      opacity: 1,
      type: "SOLID",
      visible: true
    }

    //must be placed in an array at the first index and then append to the variant
    smVariant.children[0].strokes = [strokeObj];

    //adding tiny strokeweight to mitigate thin icons
    smVariant.children[0].strokeWeight = .2;

    //selects the parent (component)
    figma.currentPage.selection = [smVariant.parent];

    const componentSet = figma.currentPage.selection;

    //Adds auto-layout & cleans the UI
    componentSet[0].layoutMode = "VERTICAL";
    componentSet[0].counterAxisAlignItems = "CENTER";
    componentSet[0].itemSpacing = 12;
    componentSet[0].counterAxisSizingMode = "AUTO";
    componentSet[0].horizontalPadding = 8;
    componentSet[0].verticalPadding = 8;

    const componentStroke = {
      blendMode: "NORMAL",
      color: {r: .592, g: .278, b: 1},
      opacity: 1,
      type: "SOLID",
      visible: true
    }

    componentSet[0].strokes = [componentStroke];

  }

  // figma.closePlugin();
  }
}