import "./css/style.css";
import * as Stats from "stats.js";

let roster_elem = null;
let scene_elem = null;
let timeline_list_elem = null;
let current_scene_element : HTMLElement = null;
let current_scene_element_name : string = null;
let file_list = {};
let counter_of_elements = 1;
let animation_list = [];
let map_of_scene_objects = {};
let stats = null;
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

function values_of_object(obj) {
  let result = [];
  for (let i in obj) {
    result.push(obj[i]);
  }
  return  result;
}

function basename(path) {
   let items = path.split('/');
   return items[items.length - 1];
}

function stopEvent(evt: Event) {
  evt.preventDefault();
  evt.stopPropagation();
}

function createItemForRoster(element_meta) : HTMLElement {
  let item = document.createElement("div");
  item.innerHTML = `
    <img src="${element_meta.image}">
    <span class="name">${element_meta.name}</span>
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
  wrapper.innerHTML = `
    <span class="scene-object-name">${timeline_item.target}</span>
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

    animation_list.push(animationBuilder(current_scene_element)
                        .property(selected_property_name)
                        .target(getCurrentSceneElementName())
                        .build());
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
        //animation_list.push(animationBuilder(image).property("translateX").startValue(0).endValue(300).startTime(0).endTime(0.5).build());
        //animation_list.push(animationBuilder(image).property("translateY").startValue(0).endValue(300).startTime(0.5).endTime(1).build());
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

  sender.open("POST", "/uploadfile", true);
  sender.setRequestHeader("Content-Type", "multipart/form-data");
  sender.setRequestHeader("X-File-Name", fileName);
  sender.setRequestHeader("X-File-Size", blob.length);
  sender.onreadystatechange = () => {
    if (sender.readyState == 4) {
      console.log(JSON.parse(sender.responseText));
      if (cb) {
        cb();
      }
    }
  };
  sender.send(blob);
}

function sendAnimation(cb = null) {
  let sending_animation_list = [];
  let image_name = '';
  let url_parser: HTMLAnchorElement = document.createElement('a');

  for (let animation of animation_list) {
    url_parser.href = animation.element.src;
    sending_animation_list.push({
      image_name: basename(url_parser.pathname),
      property: animation.property,
      startValue: animation.startValue,
      endValue: animation.endValue,
      startTime: animation.startTime,
      endTime: animation.endTime,
      easing: animation.easing
    });
  }
  sendJson({animations: sending_animation_list}, cb);
}

function sendJson(obj, cb) {
  let sender = new XMLHttpRequest();

  sender.open("POST", "/uploadjson", true);
  sender.setRequestHeader("Content-Type", "aplication/json");
  sender.onreadystatechange = () => {
    if (sender.readyState == 4) {
      console.log(JSON.parse(sender.responseText));
      if (cb) {
        cb();
      }
    }
  };
  sender.send(JSON.stringify(obj, null, 2));
}

function requestJson(path: string, cb) {
  let sender = new XMLHttpRequest();

  sender.open("GET", path, true);
  sender.onreadystatechange = () => {
    if (sender.readyState == 4) {
      let json_data = JSON.parse(sender.responseText);
      if (cb) {
        cb(json_data);
      }
    }
  };
  sender.send();

}

function animationBuilder(element: HTMLElement) {
  let new_item = {
    element: element,
    target: "",
    property: "",
    startValue: 0,
    endValue: 0,
    startTime: 0,
    endTime: 1,
    easing: "default"
  };

  return new function () {
    this.property = (value) => { new_item.property = value; return this; },
    this.target = (value) => { new_item.target = value; return this; },
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
    stats.begin();
    elapsed_seconds += (timestamp - startTime) * 0.001;
    if (elapsed_seconds > 1) {
      elapsed_seconds = 0;
    }
    startTime = timestamp;

    let transforms_wrapper = {}
    for (let item of animation_list) {
      let range = item.endValue;
      let item_id = item.target;

      if (elapsed_seconds < item.startTime) {
        range = item.startValue;
      } else if (elapsed_seconds > item.endTime) {
        range = item.endValue;
      } else if (item.endValue - item.startValue !== 0) {
        if (item.endValue > item.startValue) {
          range = (item.endValue - item.startValue) * ((elapsed_seconds - item.startTime)/(item.endTime - item.startTime));
        } else {
          range = (item.startValue - item.endValue) * (1 - (elapsed_seconds - item.startTime)/(item.endTime - item.startTime));
        }
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

    for (let transforms_obj of values_of_object(transforms_wrapper)) {
      if (transforms_obj.transforms.length > 0) {
        transforms_obj.element.style.transform = transforms_obj.transforms.join(" ");
      }
    }

    stats.end();
    requestAnimationFrame(render);
  };

  requestAnimationFrame(render);
}

function updateRoster() {
  roster_elem.innerHTML = "";
  for (let key in map_of_scene_objects) {
    let obj = map_of_scene_objects[key];
    let roster_item = createItemForRoster(obj);
    roster_elem.appendChild(roster_item);
    roster_item.addEventListener("click", () => {
      setCurrentSceneElement(obj.element, obj.name);
      document.querySelector(".timeline__current-object").innerHTML = obj.name;
    });
  }
}

function setupScene(json_data) {
  scene_elem.innerHTML = "";

  log(json_data);

  let scene_objects = {};

  for (let obj of json_data.objects) {
    let img_src = `/work_dir/img/${obj.image}`;
    let dom_elem = createImageForScene(img_src);
    scene_objects[obj.name] = dom_elem;
    map_of_scene_objects[obj.name] = {
      name: obj.name,
      image: img_src,
      element: dom_elem
    }
    scene_elem.appendChild(dom_elem);
  }

  for (let obj of json_data.animations) {
    animation_list.push(animationBuilder(scene_objects[obj.target])
                        .property(obj.property)
                        .target(obj.target)
                        .startValue(obj.startValue)
                        .endValue(obj.endValue)
                        .startTime(obj.startTime)
                        .endTime(obj.endTime)
                        .easing(obj.easing)
                        .build());
  }
}

window.addEventListener("load", () => {
  let save_animation_button = document.querySelector(".save-animation");
  roster_elem = document.querySelector("#roster");
  scene_elem = document.querySelector("#scene");
  stats = new Stats();
  stats.showPanel(0);
  document.body.appendChild(stats.dom);
  initTimeline();

  //save_animation_button.addEventListener("click", () => {
    //sendAnimation(() => {
      //console.log("Animation has been saved");
    //});
  //});
  requestJson("/work_dir/animations/animation.json", (json) => {
    setupScene(json);
    updateTimeline();
    updateRoster();
  });

  scene_elem.addEventListener("drop", dropFile, false);
  scene_elem.addEventListener("dragenter", stopEvent, false);
  scene_elem.addEventListener("dragover", stopEvent, false);
  scene_elem.addEventListener("dragleave", stopEvent, false);

  run();
});

