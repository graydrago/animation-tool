import "./css/style.css";

let roster_elem = null;
let scene_elem = null;
let timeline_list_elem = null;
let current_scene_element : HTMLElement = null;
let current_scene_element_name : string = null;
let file_list = {};
let counter_of_elements = 1;
let animation_list = [];
let list_of_properties = [
  "translateX",
  "translateY",
  "translateZ",
  "scaleX",
  "scaleY",
  "scaleZ",
  "rotateX",
  "rotateY",
  "rotateZ"
];

function log(...args: any[]) {
  console.log(args);
}

function stopEvent(evt: Event) {
  evt.preventDefault();
  evt.stopPropagation();
}

function createItemForRoster(imageSrc : string, fileName: string) : HTMLElement {
  let item = document.createElement("div");
  item.innerHTML = `
    <img src="${imageSrc}">
    <span class="name">${fileName}</span>
  `;
  item.classList.add("roster__item")

  return item;
}

function getCurrentSceneElement() : HTMLElement {
  return current_scene_element;
}

function getCurrentSceneElementName() : string {
  return current_scene_element_name;
}

function setCurrentSceneElement(item: HTMLElement, name: string) {
  current_scene_element = item;
  current_scene_element_name = name;
}

function createTimelineElement(timeline_item) {
  let wrapper : HTMLDivElement = document.createElement("div");
  let object_name = timeline_item.element.getAttribute("data-name");
  wrapper.innerHTML = `
    <span class="scene-object-name">${object_name}<span>
    <span class="property-params">
      <span class="property-name">${timeline_item.property}</span>
      <input type="text" class="property-from" value="${timeline_item.startValue}"></input>
      <input type="text" class="property-to" value="${timeline_item.endValue}"></input>
    <span>
    <span class="time-params">
      <span class="property-name">time</span>
      <input type="text" class="time-from" value="${timeline_item.startTime}"></input>
      <input type="text" class="time-to" value="${timeline_item.endTime}"></input>
    <span>
    <span><a class="remove-link">✘</a></span>
  `;

  wrapper.querySelector(".property-from").addEventListener("input", (e) => timeline_item.startValue = e.target.value);
  wrapper.querySelector(".property-to").addEventListener("input", (e) => timeline_item.endValue = e.target.value);
  wrapper.querySelector(".time-from").addEventListener("input", (e) => timeline_item.startTime = e.target.value);
  wrapper.querySelector(".time-to").addEventListener("input", (e) => timeline_item.endTime = e.target.value);
  wrapper.querySelector(".remove-link").addEventListener("click", (e) => {
    stopEvent(e);
    let index = animation_list.indexOf(timeline_item);
    if (index > -1) {
      animation_list.splice(index, 1);
      updateTimeline();
    }
  });

  return wrapper;
}

function initTimeline() {
  timeline_list_elem = document.querySelector(".timeline__property-list") as HTMLDivElement;
  let property_selector_elem = document.querySelector(".timeline__select-property") as HTMLSelectElement;
  let add_button_elem = document.querySelector(".timeline__add-property") as HTMLButtonElement;


  for (let name of list_of_properties) {
    let option = document.createElement("option");
    option.label = name;
    option.value = name;
    property_selector_elem.appendChild(option);
  }

  add_button_elem.addEventListener("click", () => {
    let current_scene_element = getCurrentSceneElement();
    if (!current_scene_element) {
      console.warn("Current Element Not Found");
      return;
    }

    let scene_object_name = getCurrentSceneElementName();
    let selected_property_name = property_selector_elem.options[property_selector_elem.selectedIndex].value;

    animation_list.push(animationBuilder(current_scene_element).property(selected_property_name).build());
    updateTimeline();
  });
}

function updateTimeline() {
  timeline_list_elem.innerHTML = "";
  for (let item of animation_list) {
    var property_elem = createTimelineElement(item);
    timeline_list_elem.appendChild(property_elem);
  }
}

function createImageForScene(src : string) : HTMLImageElement {
  let image = new Image();
  image.src = src;
  image.style.position = "absolute";
  image.style.left = "0";
  image.style.top = "0";
  image.style.width = "100px";
  image.style.width = "100px";
  image.style.transform = `translateX(0) translateY(0)`;
  return image;
}

function dropFile(evt: DragEvent) {
  stopEvent(evt);
  console.log("HERO");

  for (let file of evt.dataTransfer.files) {
    let reader = new FileReader();
    reader.onload = (evt) => {
      let saved_counter = counter_of_elements;
      counter_of_elements++;
      let fileName = file.name;

      sendFile(fileName, reader.result, () => {
        let imageSrc = `/work_dir/img/${fileName}`;
        let image = createImageForScene(imageSrc);
        image.setAttribute("data-name", fileName);
        image.setAttribute("data-id", saved_counter.toString());
        scene_elem.appendChild(image);

        let rosterItem = createItemForRoster(imageSrc, fileName);
        setCurrentSceneElement(image, fileName);
        rosterItem.addEventListener("click", () => {
          setCurrentSceneElement(image, fileName);
        });
        roster_elem.appendChild(rosterItem);

        //let animation = animationBuilder(image).property("translateX").startValue(0).endValue(200).build();
        animation_list.push(animationBuilder(image).property("translateX").startValue(0).endValue(300).startTime(0).endTime(0.5).build());
        animation_list.push(animationBuilder(image).property("translateY").startValue(0).endValue(300).startTime(0.5).endTime(1).build());
        //animation_list.push(animationBuilder(image).property("rotateZ").startValue(0).endValue(Math.random() > 0.5 ? 360 : -360).build());
        //animation_list.push(animationBuilder(image).property("rotateY").startValue(0).endValue(Math.random() > 0.5 ? 360 : -360).build());
        //animation_list.push(animationBuilder(image).property("rotateX").startValue(0).endValue(Math.random() > 0.5 ? 360 : -360).build());
        //animation_list.push(animationBuilder(image).property("scaleY").startValue(1).endValue(4).build());
        //animation_list.push(animationBuilder(image).property("scaleX").startValue(1).endValue(4).build());
        updateTimeline();
      });

    };
    reader.readAsBinaryString(file);
  }
}

function sendFile(fileName, blob, cb) {
  let sender = new XMLHttpRequest();
  //var base64_data = base64_full.replace(/.*,/, "");

  sender.open("POST", "/ajax", true);
  sender.setRequestHeader("Content-Type", "multipart/form-data");
  sender.setRequestHeader("X-File-Name", fileName);
  sender.setRequestHeader("X-File-Size", blob.length);
  sender.onreadystatechange = () => {
    if (sender.readyState == 4) {
      console.log(JSON.parse(sender.responseText));
      cb();
    }
  };
  sender.send(blob);
}

function animationBuilder(element: HTMLElement) {
  let new_item = {
    element: element,
    property: "",
    startValue: 0,
    endValue: 0,
    startTime: 0,
    endTime: 1,
    easing: "default"
  };

  return new function () {
    this.property = (value) => { new_item.property = value; return this; },
    this.startValue = (value) => { new_item.startValue = value; return this; },
    this.endValue = (value) => { new_item.endValue = value; return this; },
    this.startTime = (value) => { new_item.startTime = value; return this; },
    this.endTime = (value) => { new_item.endTime = value; return this; },
    this.easing = (value) => { new_item.easing = value; return this; },
    this.build = () => { log(this, new_item); return new_item; }
  };
}

function dragImageFromRoster(evt: DragEvent) {
  evt.dataTransfer.dropEffect = "copy";
  evt.dataTransfer.setData("src", evt.target.src);
}

function run() {
  let startTime = performance.now();
  let elapsed_seconds = 0;

  let render = (timestamp) => {
    elapsed_seconds += (timestamp - startTime) * 0.001;
    if (elapsed_seconds > 1) {
      elapsed_seconds = 0;
    }
    startTime = timestamp;

    let transforms_wrapper = {}
    for (let item of animation_list) {
      let range = item.endValue;
      let item_id = item.element.getAttribute("data-id");

      if (elapsed_seconds < item.startTime) {
        range = item.startValue;
      } else if (elapsed_seconds > item.endTime) {
        range = item.endValue;
      } else if (item.endValue - item.startValue !== 0) {
        range = (item.endValue - item.startValue) * ((elapsed_seconds - item.startTime)/(item.endTime - item.startTime));
      } 

      if (!transforms_wrapper[item_id]) {
        transforms_wrapper[item_id] = {
          element: item.element,
          transforms: []
        };
      }

      switch (item.property) {
        case "translateX":
        case "translateY":
        case "translateZ":
          transforms_wrapper[item_id].transforms.push(`${item.property}(${range}px)`);
          break;
        case "rotateX":
        case "rotateY":
        case "rotateZ":
          transforms_wrapper[item_id].transforms.push(`${item.property}(${range}deg)`);
          break;
        case "scaleX":
        case "scaleY":
        case "scaleZ":
          transforms_wrapper[item_id].transforms.push(`${item.property}(${range})`);
          break;
      }
    }

    for (let transforms_obj of Object.values(transforms_wrapper)) {
      if (transforms_obj.transforms.length > 0) {
        transforms_obj.element.style.transform = transforms_obj.transforms.join(" ");
      }
    }

    requestAnimationFrame(render);
  };

  requestAnimationFrame(render);
}

window.addEventListener("load", () => {
  roster_elem = document.querySelector("#roster");
  scene_elem = document.querySelector("#scene");
  initTimeline();

  scene_elem.addEventListener("drop", dropFile, false);
  scene_elem.addEventListener("dragenter", stopEvent, false);
  scene_elem.addEventListener("dragover", stopEvent, false);
  scene_elem.addEventListener("dragleave", stopEvent, false);

  run();
});

