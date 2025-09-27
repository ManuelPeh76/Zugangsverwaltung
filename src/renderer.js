/*  Zugangsverwaltung

    File: renderer.js
    Author: Manuel Pelzer
    Copyright © 2025 By Manuel Pelzer
    MIT License
*/
(function() {

document.querySelector(".help").innerHTML = /*html*/`<pre><h1><center>Zugangsverwaltung</center></h1>
    <b>Tastenkürzel (wenn eingeloggt):</b>
    -------------------------------
    Pfeil hoch/runter  : Zum vorherigen/nächsten Eintrag wechseln
    Pfeil links/rechts : Details ein-/ausklappen
    Leertaste          : Alle Passwörter im aktuellen Eintrag anzeigen
    Escape             : Bearbeiten/Neu abbrechen

    Strg + N           : Wechselt in den Master-Passwort-Änderungsmodus.
                         Das neue Master-Passwort kann nun eingegeben werden
                         (die Eingabe erfolgt unsichtbar, d.h. es wird nichts angezeigt).
                         Hierbei gelten folgende Tastenkürzel:
    Escape             : Master-Passwort-Eingabe abbrechen
    Backspace          : Letztes Zeichen der Master-Passwort-Eingabe löschen
    Enter              : Master-Passwort übernehmen</pre><br>
    <div align="center"><button class="help-button">Schließen</button></div>`;
  document.querySelector(".help-button").onclick = showHelp;
  
  const addItemHtml = /*html*/`<div class="new-item"><div class="element-id"><label for="name">Account: </label><input class="registered" type="text" data-id="name"><br><label for="email">Email: </label><input class="registered" type="text" data-id="email"><br><label for="user">Benutzername: </label><input class="registered" type="text" data-id="user" autocomplete="off"><br><label for="pw">Passwort: </label><input class="registered" type="password" data-id="pw" value="" autocomplete="off"><span class="show">(show)</span><br><label for="key">Registrierungs-Key: </label><input class="registered" type="text" data-id="key"></div><a class="del-item">[<span title="Diesen Eintrag entfernen" style="color:#f63;font-weight:bold">x</span>]</a></div>`;
  const each = (items, cb) => items.constructor === Object ? Object.entries(items).forEach(([key, value], index) => cb(key, value, index)) : [...items].forEach((key, index) => cb(key, index));
  const Stars = "********";
  const storage = window.localStorage || {};
  const minimizer = document.querySelector(".minimizer");
  const maximizer = document.querySelector(".maximizer");
  const closer = document.querySelector(".closer");
  const sort = (a, b) => {
    const nameA = a.name.toUpperCase();
    const nameB = b.name.toUpperCase();
    return nameA < nameB ? -1 : nameA > nameB ? 1 : 0;
  };
  let Hash = storage.duckyHash || "c2VjcmV0";
  let listenToKeys = 0;
  let H1, N, activeElement, activeElements, R = {}, Access = 0, Secret = "", T = "", timeout, interval, interval2, oldEl, New = "";
  
  const onLoad = function (e) {
    removeEventListener("blur", accessDenied);
    removeEventListener("keydown", handleKeys);
    removeEventListener("contextmenu", preventDefault);
    interval2 && clearInterval(interval2);

    let c = JSON.parse(atob(loadFromStorage("entry") || decodeArray(0)) || "[]").sort(sort);
    document.querySelector(".box").innerHTML = listItems(c);
    setTimeout(hideAll, 100);
    !storage.entry && saveToStorage("entry", btoa(JSON.stringify(c)));
    !storage.old && saveToStorage("old", btoa(JSON.stringify([])));
    H1 = [...document.querySelectorAll("h1")];
    setListeners();
    if (typeof e === "number" && e === 1) {
      Access = 1;
      Secret = atob(Hash);
    }
    interval2 = setInterval(checkAccess, 300);
    addEventListener("blur", accessDenied);
    addEventListener("keydown", handleKeys);
    addEventListener("contextmenu", preventDefault);
  };

  addEventListener("load", onLoad);

  minimizer.addEventListener("click", () => (minimizer.blur(), api.minimize()));
  maximizer.addEventListener("click", async () => {
    await api.maximize() ? (
      maximizer.innerHTML = /*html*/`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 22"><path d="M4,8H8V4H20V16H16V20H4V8M16,8V14H18V6H10V8H16M6,12V18H14V12H6Z" /></svg>`,
      maximizer.title = "Restore"
    ) : (
      maximizer.innerHTML = /*html*/`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 550 550"><path d="M.3 89.5C.1 91.6 0 93.8 0 96L0 224 0 416c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-192 0-128c0-35.3-28.7-64-64-64L64 32c-2.2 0-4.4 .1-6.5 .3c-9.2 .9-17.8 3.8-25.5 8.2C21.8 46.5 13.4 55.1 7.7 65.5c-3.9 7.3-6.5 15.4-7.4 24zM48 224l416 0 0 192c0 8.8-7.2 16-16 16L64 432c-8.8 0-16-7.2-16-16l0-192z"/></svg>`,
      maximizer.title = "Maximize"
    );
  });

  closer.addEventListener("click", api.quit);

  function preventDefault(a) {
    a.preventDefault();
    a.stopPropagation();
  }

  async function updateDataJs(backup = null) {
    if (!Access) return;
    let c = JSON.parse(atob(loadFromStorage("entry") || decodeArray(0))).sort(sort);
    const result = await api.saveNewJs({ str: encodeArray(btoa(JSON.stringify(c))), backup });
    if (typeof result === "string") return alert(`Fehler beim Speichern:\n${result}`);
    setTimeout(() => { delete storage.entry; }, 100);
    setTimeout(() => { delete storage.old; }, 200);
    !backup && alert("Speichern erfolgreich!");
    setTimeout(function() { onLoad(1); }, 10);
  }

  function setListeners() {
    document.querySelector(".add-item") && (document.querySelector(".add-item").onclick = addItem);
    document.querySelector(".bac") && (document.querySelector(".bac").onclick = () => listElements(1));
    document.querySelector(".imp") && (document.querySelector(".imp").onclick = importJSON);
    document.querySelector(".exp") && (document.querySelector(".exp").onclick = exportJSON);
    document.querySelector(".exs") && (document.querySelector(".exs").onclick = () => updateDataJs());
    document.querySelector(".new") && (document.querySelector(".new").onclick = showAddForm);
    document.querySelector(".res") && (document.querySelector(".res").onclick = listElements);
    document.querySelector(".cha") && (document.querySelector(".cha").onclick = showEditForm);
    document.querySelector(".chb") && (document.querySelector(".chb").onclick = saveEntryFromForm);
    document.querySelector(".faq") && (document.querySelector(".faq").onclick = showHelp);
    document.querySelector(".ccl") && (document.querySelector(".ccl").onclick = cancel);

    document.querySelectorAll(".show").length && each(document.querySelectorAll(".show"), a => (a.onclick = () => toggle("pw")));
    document.querySelectorAll(".show-key").length && each(document.querySelectorAll(".show-key"), a => (a.onclick = () => toggle("key")));
    document.querySelectorAll(".sh").length && each(document.querySelectorAll(".sh"), a => a.onclick = toggleHidden);
    document.querySelectorAll(".re").length && each(document.querySelectorAll(".re"), a => a.onclick = restoreEntry);
    document.querySelectorAll(".ed").length && each(document.querySelectorAll(".ed"), a => a.onclick = showEditForm);
    document.querySelectorAll(".del").length && each(document.querySelectorAll(".del"), a => a.onclick = removeEntry);
    document.querySelectorAll(".pw").length && each(document.querySelectorAll(".pw"), a => (a.onblur = a => hidePw(a.target)));
    document.querySelectorAll(".pw").length && each(document.querySelectorAll(".pw"), a => (a.onmouseup = a => showPw(a.target)));
  }

  function removeListeners() {
    document.querySelector(".add-item") && (document.querySelector(".add-item").onclick = null); // new Item
    document.querySelector(".bac") && (document.querySelector(".bac").onclick = null);
    document.querySelector(".ccl") && (document.querySelector(".ccl").onclick = null);
  }

  function addItem() {
    const newEntry = document.getElementById("newItem"),
      newChildren = document.querySelector(".new-items");
    let registered = newChildren.querySelectorAll(".registered");
    const j = [];
    registered.forEach((a, c) => (j[c] = a.value));
    newChildren.innerHTML += addItemHtml;
    const style = newEntry.getBoundingClientRect();
    style.height > innerHeight && newEntry.classList.replace("add", "add-big");
    document.querySelectorAll(".del-item").length && each(document.querySelectorAll(".del-item"), a => a.onclick = removeItem);
    each(document.querySelectorAll(".show"), a => a.onclick = () => toggle("pw"));
    each(document.querySelectorAll(".show-key"), a => a.onclick = () => toggle("key"));
    registered = newChildren.querySelectorAll(".registered");
    each(j, (a, c) => registered[c].value = a);
  }

  function removeItem() {
    let parent = this.parentElement.parentElement;
    let container = document.getElementById("newItem");
    parent.children.length > 1 && parent.removeChild(this.parentElement);
    const style = container.getBoundingClientRect();
    style.height < innerHeight && container.classList.replace("add-big", "add");
    document.querySelector(".add-item") && (document.querySelector(".add-item").onclick = addItem);
  }

  function toggle(e) {
    event.target.parentElement.querySelector("[data-id=" + e + "]").type = event.target.parentElement.querySelector("[data-id=" + e + "]").type === "text" ? "password" : "text";
  }

  function flash(el) {
    oldEl && (oldEl.style.backgroundColor = "");
    oldEl = el;
    el.style = "transition: background-color 250ms";
    let count = 0;
    interval && clearInterval(interval);
    interval = setInterval(() => {
      el.style.backgroundColor = el.style.backgroundColor ? "" : "#aaa";
      ++count === 4 && (
        clearInterval(interval),
        (el.style.backgroundColor = ""),
        (oldEl = null)
      );
    }, 300);
  }

  function handleKeys(e) {
    if (e.target.tagName === "INPUT") return;
    let el = document.querySelector(".activeEl") || H1[0];

    if (Access) {

      if (listenToKeys) {
        e.preventDefault();
        if (e.key === "Escape") return listenToKeys = 0, New = "";
        if (e.key === "Backspace") return New = New.slice(0, -1);
        if (e.key === "Enter") return Hash = btoa(New), listenToKeys = 0, New = "", T = "", storage.duckyHash = Hash;
        return New += e.key;
      }

      if (~[27, 32, 37, 38, 39, 40].indexOf(e.keyCode)) {
        e.preventDefault();
        if (e.keyCode === 37) toggleHidden.call(el, 1);
        else if (e.keyCode === 27) document.querySelector(".ccl") && cancel();
        else if (e.keyCode === 39) toggleHidden.call(el, 2);
        else if (e.keyCode === 38) scroll(el, 2);
        else if (e.keyCode === 40) scroll(el, 1);
        else if (e.keyCode === 32 && activeElement) each(activeElement.querySelectorAll(".w"), (w) => showPw(w, 1));
      } else if (e.ctrlKey && e.key.toLowerCase() === "n") {
        e.preventDefault();
        listenToKeys = 1;
        New = "";
        return;
      }

      T += e.key;
      
      for (let a = 0; a < H1.length; a++) {
        if (H1[a].innerHTML.split(": ")[1].toLowerCase().substring(0, T.length) === T) {
          each(H1, h => h.classList.remove("activeEl"));
          H1[a].classList.add("activeEl");
          intoView(H1[a]);
          timeout && clearTimeout(timeout);
          timeout = setTimeout(() => flash(H1[a]), 1000);
        }
      }
      N && clearTimeout(N);
      N = setTimeout(() => T = "", 1000);

      function scroll(el, a) {
        let active = H1.indexOf(el);
        el.classList.remove("activeEl");
        a === 1 ? active < H1.length - 1 && active++ : a === 2 && active > 0 && active--;
        el = H1[active];
        el.classList.add("activeEl");
        intoView(el);
      }
    } else {
      Secret += e.key;
      atob(Hash).indexOf(Secret) === -1 ? Secret = event.key === atob(Hash)[0] ? event.key : "" : Access = atob(Hash) === Secret ? 1 : 0;
      Access ? (
        hideAll(),
        el = document.querySelector(".activeEl"),
        !el && (el = H1[0], el?.classList.add("activeEl"))
      ) : el && el?.classList.remove("activeEl");
    }
  }

  function showHelp() {
    let help = document.querySelector(".help");
    help.style.opacity == 1 ? (
      help.style.opacity = 0,
      setTimeout(() => help.style="top:-100vh;left:-100vw;", 500)
    ) : help.style = "top: 50vh;left:50vw;opacity:1;";
  }

  function intoView(el) {
    el.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function checkAccess() {
    Access = atob(Hash) === Secret ? 1 : 0;
    ((Access && document.querySelector(".edit").style.opacity == 0) || 
    (!Access && document.querySelector(".edit").style.opacity == 1)) && (
      document.querySelectorAll(".edit").forEach(a => a.style.opacity = Access ? 1 : 0),
      each(document.querySelectorAll(".edit, H1, .w"), a => (a.style.cursor = Access ? "pointer" : "default", a.style.pointerEvents = Access ? "" : "none"))
    );
  }

  function accessDenied() {
    Access = 0;
    Secret = "";
    hideAll();
    document.querySelector(".activeEl")?.classList.remove("activeEl");
  }

  function hideAll() {
    each(document.querySelectorAll(".w"), a => a.textContent = Stars);
    each(document.querySelectorAll(".entry"), a => a.classList.add("hidden"));
    document.getElementById("newItem").classList.add("form-hidden");
    each(document.querySelectorAll(".edit, H1, .w"), a => (a.style.cursor = Access ? "pointer" : "default", a.style.pointerEvents = Access ? "" : "none"));
  }

  function listItems(a, c) {
    document.getElementById("newItem").innerHTML = /*html*/`
      <div>
          <form id="addform" autocomplete="off">
              <div align="center">
                  <label for="name">Anzeige-Name: </label>
                  <input class="item" type="text" data-id="name"><br>
                  <label for="platform">Plattform (http://...): </label>
                  <input class="item" type="text" data-id="platform"><br>
                  <label for="info">Info: </label>
                  <input class="item" type="text" data-id="info">
                  <div class="new-items">${addItemHtml}</div><br>
                  <a class="add-item">[+]</a><br><br>
                  <input type="button" class="chb" value="Neuen Eintrag übernehmen">
                  <input type="button" class="ccl" value="Abbrechen">
              </div>
          </form>
      </div>`;
    let d = 1,
      out = c === "restore" ? "<div align='center'><h1>Entfernte Einträge</h1></div>" : "";
    out += c === "restore" ? /*html*/`
          <form>
              <div align='center'>&nbsp;<br><br></div>
              <input type='file' accept='.json' style='position:fixed;top:-200px;opacity:0'>
              <div align='center'>
                  <span class="head-button edit bac">Zurück</span>
              </div>
      ` : /*html*/`
          <form>
              <div align='center'>
                  <input type='file' accept='.json' style='position:fixed;top:-200px;opacity:0'>
                  <span class="head-button edit imp">Import</span>
                  <span class="head-button edit exp">Export</span>
                  <span class="head-button edit exs">Speichern</span>
                  <span class="head-button edit new">Neu</span>
                  <span class="head-button edit res">Wiederherstellen</span>
                  <span class="head-button edit faq">?</span>
              </div>
      `;
    if (!a) return out + "</form>";
    a = a.sort(sort);
    out += "<div><pre>";
    a.length ? each(a, function (entry) {
      out += `<h1 class="sh" id="${d}">Eintrag ${(d < 10 ? "0" : "") + d}: ${entry.name}<span class="right"><a class="edit ${c === "restore" ? "re" : "ed"}" data-id="%id%">${c === "restore" ? "Wiederherstellen" : "Bearbeiten"}</a><a class="edit del" data-id="%id%" data-mode="${c}">${c === "restore" ? "Endgültig löschen" : "Entfernen"}</a></span></h1>`;
      entry.platform && (out += ` Plattform: ${entry.platform}<br />`);
      entry.info && (out += `      Info: ${entry.info}`);
      out += `<div id="div${d++}" class="entry hidden">   Details:<br />`;
      entry.registered.forEach(function (props) {
        for (prop in props) {
          if (prop === "id" || prop === "pw") continue;
          if (props[prop]) {
            if (prop === "user") out += `    Benutzername: ${props[prop]}<br>`;
            else out += `${"                ".substring(prop.length)}${prop[0].toUpperCase()}${prop.substring(1)}: ${props[prop]}<br>`;
          }
        }
        out += `        Passwort: <span class="w pw" id="${props.id}">********</span><br>`;
        R[props.id] = props.pw;
        out += "<br>";
        out = out.replace(/%id%/g, props.id);
      });
      out += "</div><br>";
    }) : out += "Keine Einträge vorhanden";
    out += "</pre></div></form>";
    return out;
  }

  function toggleHidden(force = null) {
    if (!Access || !(this instanceof Element)) return;
    document.querySelector(".activeEl")?.classList.remove("activeEl");
    this.classList.add("activeEl");
    el = this.id;
    let c = document.querySelector("#div" + el);
    each(c.querySelectorAll(".w"), (c) => (c.textContent = Stars));
    activeElement && activeElement !== c && (
      activeElement.classList.add("hidden"),
      each(activeElement.querySelectorAll(".w"), (c) => (c.textContent = Stars))
    );
    let add = force === 1 ? "add" : force === 2 ? "remove" : "toggle";
    c.classList[add]("hidden");
    activeElement = c.classList.contains("hidden") ? null : c;
    intoView(this);
  }

  function showPw(c, force) {
    Access && (
      c.textContent = c.textContent === Stars ? atob(R[c.id]) : Stars,
      !force && each(c.parentElement.querySelectorAll(".w"), d => {
        d !== c && (d.textContent = Stars);
      })
    );
  }

  function hidePw(a) {
    a.textContent = Stars;
  }

  function findElement(elements, id) {
    for (let e = 0; e < elements.length; e++)
      for (let a = 0; a < elements[e].registered.length; a++)
        if (elements[e].registered[a].id == id) return [elements[e], e];
  }

  function loadFromStorage(a) {
    return storage[a] ? decodeArray(storage[a]) : false;
  }

  function saveToStorage(a, c) {
    storage[a] = encodeArray(c);
    return !!storage[a];
  }

  function removeEntry(c) {
    if (!Access) return;
    let id = c.target.dataset.id, mode = c.target.dataset.mode;
    event.stopPropagation();
    if (mode === "restore") {
      activeElements.splice(findElement(activeElements, id)[1], 1);
      saveToStorage("old", btoa(JSON.stringify(activeElements)));
      listElements();
      return;
    }
    let foundItem, item, allItems = JSON.parse(atob(loadFromStorage("entry") || decodeArray(0)));
    foundItem = findElement(allItems, id);
    item = foundItem[0];
    allItems.splice(foundItem[1], 1);
    let removedItems = loadFromStorage("old") ? JSON.parse(atob(loadFromStorage("old"))) : [];
    removedItems.push(item);
    saveToStorage("old", btoa(JSON.stringify(removedItems)));
    saveToStorage("entry", btoa(JSON.stringify(allItems)));
    listElements(1);
  }

  function listElements(mode) {
    typeof mode == "object" && (mode = null);
    let items = loadFromStorage(mode ? "entry" : "old") || null;
    if (!items) return;
    items = JSON.parse(atob(items));
    activeElements = items;
    document.querySelector(".box").innerHTML = listItems(activeElements, mode ? "" : "restore");
    setListeners();
    hideAll();
  }

  function restoreEntry(a) {
    let c = a.target.dataset.id;
    event.stopPropagation();
    if (!Access || !loadFromStorage("old")) return;
    let allItems = loadFromStorage("entry") || [];
    allItems && typeof allItems != "object" && (allItems = JSON.parse(atob(allItems)));
    let removedItems = JSON.parse(atob(loadFromStorage("old"))),
      removedItem = findElement(removedItems, c),
      restoredItem = removedItem[0];
    removedItems.splice(removedItem[1], 1);
    let newId = getFreeId();
    restoredItem.registered.length > 1 ? restoredItem.registered.forEach((c, a) => restoredItem.registered[a].id = newId + "-" + a) : restoredItem.registered[0].id = newId;
    allItems.push(restoredItem);
    allItems = allItems.sort(sort);
    saveToStorage("old", btoa(JSON.stringify(removedItems)));
    saveToStorage("entry", btoa(JSON.stringify(allItems)));
    listElements();
  }

  function getFreeId() {
    const a = JSON.parse(atob(loadFromStorage("entry"))), c = [];
    let d = 0;
    for (a.forEach(a => a.registered.forEach(a => c.push(`${a.id}`))); c.indexOf(`${d}`) > -1 || c.indexOf(`${d}-0`) > -1;) d++;
    return d;
  }

  function saveEntryFromForm(id) {
    if (!Access) return;
    typeof id !== "string" && typeof id !== "number" && (id = null);
    let newId,
      container = document.getElementById("newItem"),
      children = document.querySelectorAll(".item"),
      elements = document.querySelectorAll(".element-id"),
      props = {},
      entry = JSON.parse(atob(loadFromStorage("entry"))),
      element = id ? findElement(entry, id) : null;
    each(children, a => props[a.dataset.id] = a.value);
    props.registered = [];
    elements[0].id || (newId = getFreeId());
    each(elements, (el, counter) => {
      props.registered[counter] || (props.registered[counter] = {});
      let elementId = el.id || newId.toString();
      elementId.indexOf("-") > -1 && (elementId = elementId.split("-")[0]);
      elements.length > 1 && (elementId += "-" + counter);
      const registeredElements = el.querySelectorAll(".registered");
      props.registered[counter].id = elementId;
      each(registeredElements, child => {
        props.registered[counter][child.dataset.id] =
          child.dataset.id === "pw" ? btoa(child.value) : child.value;
      });
    });
    container.classList.add("form-hidden");
    container.classList.replace("add-big", "add");
    id ? entry[element[1]] = props : entry.push(props);
    entry = entry.sort(sort);
    saveToStorage("entry", btoa(JSON.stringify(entry)));
    listElements(1);
  }

  function showAddForm() {
    !document.getElementById("addform") && (
      document.getElementById("newItem").innerHTML = /*html*/`
              <div>
                  <form id="addform" autocomplete="off">
                      <div class="center">
                          <label for="name">Anzeige-Name: </label>
                          <input class="item" type="text" data-id="name" /><br>
                          <label for="platform">Plattform (http://...): </label>
                          <input class="item" type="text" data-id="platform" /><br>
                          <label for="info">Info: </label>
                          <input class="item" type="text" data-id="info" />
                          <div class="new-items">${addItemHtml}</div><br>
                          <a class="add-item">[+]</a><br><br>
                          <input type="button" class="chb" value="Neuen Eintrag übernehmen" />
                          <input type="button" class="ccl" value="Abbrechen" />
                      </div>
                  </form>
              </div>`,
      setListeners()
    );
    document.getElementById("newItem").classList.remove("form-hidden");
  }

  function showEditForm(a) {
    let c = typeof a == "object" ? a.target.dataset.id : a;
    event.stopPropagation();
    if (!Access) return;
    let entry, container, element, index, html, rect;
    c ? (
      entry = JSON.parse(atob(loadFromStorage("entry"))),
      container = document.getElementById("newItem"),
      [element, index] = findElement(entry, c),
      html = /*html*/`
              <div>
                  <form id="editform">
                      <center>
                          <p>
                              <label for="name">Anzeige-Name: </label>
                              <input class="item" type="text" data-id="name" value="${element.name || ""}"><br>
                              <label for="platform">Plattform (http://...): </label>
                              <input class="item" type="text" data-id="platform" value="${element.platform || ""}"><br>
                              <label for="info">Info: </label>
                              <input class="item" type="text" data-id="info" value="${element.info || ""}"><br>`,
      element.registered.forEach(a => {
        html += /*html*/`
                              <br>
                              <div class="element-id" id="${a.id}">
                                  <label for="name">Account: </label>
                                  <input class="registered" type="text" data-id="name" value="${a.name || ""}"><br>
                                  <label for="mail">Email: </label>
                                  <input class="registered" type="text" data-id="mail" value="${a.mail || ""}"><br>
                                  <label for="user">Benutzername: </label>
                                  <input class="registered" type="text" data-id="user" value="${a.user || ""}"><br>
                                  <label for="pw">Passwort: </label>
                                  <input class="registered" type="password" data-id="pw" value="${atob(a.pw) || ""}">
                                  <span class="show">(show)</span><br>
                                  <label for="key">Registrierungs-Key: </label>
                                  <input class="registered" type="text" data-id="key" value="${a.key || ""}">
                              </div>
                              <br>`;
      }),
      html += /*html*/`
                              <input type="button" class="cha" value="Übernehmen">
                              <input type="button" class="ccl" value="Abbrechen">
                          </p>
                      </center>
                  </form>
              </div>`,
      container.innerHTML = html,
      document.querySelector(".cha").onclick = () => showEditForm(),
      document.querySelector(".ccl").onclick = cancel,
      each(document.querySelectorAll(".show"), a => a.onclick = () => toggle("pw")),
      rect = container.getBoundingClientRect(),
      rect.height > innerHeight && container.classList.replace("add", "add-big"),
      container.classList.remove("form-hidden"),
      container.scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" })
    ) : (c = document.querySelector(".element-id").id) && saveEntryFromForm(c);
  }

  function cancel() {
    let container = document.getElementById("newItem");
    container.classList.add("form-hidden");
    container.classList.replace("add-big", "add");
    removeListeners();
  }

  function importJSON() {
    if (!Access && !storage.access) return;
    let file = document.querySelector("input[type=file]");
    if (!file.files.length) return storage.access = 1, file.click(), file.addEventListener("change", importJSON);
    if ((Access = storage.access || 0)) Secret = atob(Hash);
    delete storage.access;
    file = file.files[0];
    const reader = new FileReader();
    reader.readAsText(file);
    reader.addEventListener("load", function () {
      if (confirm( "Daten wirklich übernehmen? \n\nACHTUNG!\nBereits vorhandene Daten sind dann verloren!")) {
        let { entry: a, old: d } = JSON.parse(reader.result);
        saveToStorage("old", btoa(JSON.stringify(d)));
        saveToStorage("entry", btoa(JSON.stringify(a)));
        updateDataJs(1);
      }
    });
  }

  function exportJSON() {
    if (!Access) return;
    const c = storage.entry ? JSON.parse(atob(loadFromStorage("entry"))) : [],
      d = storage.old ? JSON.parse(atob(loadFromStorage("old"))) : [],
      e = JSON.stringify({ entry: c, old: d }, null, "  "),
      a = document.createElement("a");
    a.download = "ame.data.json";
    a.href = URL.createObjectURL(new Blob([e], { type: "text/json" }));
    a.click();
    URL.revokeObjectURL(a.href);
    setTimeout(() => Secret = atob(Hash), 1000);
  }

  function decodeArray(a) {
    if (a === null || (typeof a !== "string" && typeof a !== "number")) return;
    let b = (a === 0 ? data() : a.split(",")).map((e) => -e);
    b = b.map((e) => String.fromCharCode(~e)).join("");
    return b;
  }

  function encodeArray(c) {
    if (!c || typeof c !== "string") return;
    let i = 0, d = [];
    for (; i < c.length; i++) d.push(~c[i].charCodeAt(0));
    return d.map((a) => -a).join(",");
  }
})();