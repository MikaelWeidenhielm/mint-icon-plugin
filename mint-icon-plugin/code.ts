figma.showUI(__html__);

figma.ui.resize(280, 480);


figma.ui.onmessage = (message) => {

  if(message === "close") {
    figma.closePlugin()
  }

  if (message === "icon-template") {
    
      const tempComponent = figma.root
          .findAll(node => node.type === 'COMPONENT' && node.name === ".icon_template");

          if(tempComponent[0]) {
          
            const instance = tempComponent[0].createInstance().detachInstance();
            
            figma.currentPage.appendChild(instance);
            figma.currentPage.selection = [instance];
            const {x, y} = figma.viewport.center;
            
            instance.x = x;
            instance.y = y;
            
            const selection = figma.currentPage.selection[0];

            selection.name = "icon template"
          } else {

            figma.ui.postMessage("template not found")
            return;
            
          }
  }

  if(message === "generate-icon") {
    for (const node of figma.currentPage.selection) {

    for (const child of node.children) {
      if(child.type === "INSTANCE" || child.type === "FRAME" && child.name === ".icon_template") {
        child.remove();
      } else {
        child.name = "outlinedVector"
      }
    }

    //Flatten vector
    figma.flatten(node.children, node);
    node.children[0].constraints = { horizontal: 'SCALE', vertical: 'SCALE' }

    console.log(node.children[0].constraints)


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
    const componentCloneMedium = component.clone();
    const componentCloneSmall = component.clone();

    //sets the selection to the newly created components
    figma.currentPage.selection = [component, componentCloneMedium, componentCloneSmall];

    //combines them as a variant
    figma.combineAsVariants(figma.currentPage.selection, figma.currentPage)

    //removes the initally selected icon frame
    node.remove();

    //creates references to the two variants
    const lgVariant = figma.currentPage.selection[0];
    const mdVariant = figma.currentPage.selection[1];
    const smVariant = figma.currentPage.selection[2];

    //large size icon
    lgVariant.name = "size=large"
    lgVariant.children[0].name = "vector"

    //medium size icon
    mdVariant.name = "size=medium"
    mdVariant.children[0].name = "vector"
    mdVariant.resize(20, 20);

    //small size icon
    smVariant.name = "size=small"
    smVariant.children[0].name = "vector"
    smVariant.resize(16, 16);

    //selects the parent (component)
    figma.currentPage.selection = [lgVariant.parent];

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
  }
}
