import { Socket } from 'phoenix'
import { RateLimiter } from "limiter";

const murmurhash = require('murmurhash')

let Talio = {
  nonce: null,
  branch_status: false,

  // Debug Variables
  debug: false, // Debug Status
  zindex: 0, // Debug zIndex

  // Connection Status
  terminated: false,
  socket_base_addr: "ws://localhost:4000",

  // Page Information
  page: {
    branch: {
      fingerprint: null
    },
  },

  // Device Information
  device: {
    // View Ports
    view_ports: {
      // Return Current View Port
      current: function(__MODULE__) {
        const view_port = {
          //// View Port Based on Device User Agent
          // user_agent: __MODULE__.device.view_ports[__MODULE__.device.humanized_target().toLowerCase()],

          // Based on Calculated Device Screen
          target: null,
        }
        // Based On Responsiveness of Device Screen
        if(window.innerWidth >= __MODULE__.device.view_ports.desktop.width) {
          view_port.target = "desktop"
          view_port.device = 0
          view_port.width = __MODULE__.device.view_ports.desktop.width
        }
        if(window.innerWidth <= __MODULE__.device.view_ports.tablet.width ||
          window.innerWidth <= __MODULE__.device.view_ports.desktop.width) {
          view_port.target = "tablet"
          view_port.device = 1
          view_port.width = __MODULE__.device.view_ports.tablet.width
        }
        if(window.innerWidth <= __MODULE__.device.view_ports.mobile.width) {
          view_port.target = "mobile"
          view_port.device = 2
          view_port.width = __MODULE__.device.view_ports.mobile.width
        }

        return view_port
      },

      // Pre-Defined View Ports
      desktop: {
        width: 1280,
      },
      tablet: {
        width: 800,
      },
      mobile: {
        width: 380,
      }
    },

    target: null,
    types: {
      0: "Desktop", 
      1: "Tablet", 
      2: "Mobile"
    },
    screen: {
      width: window.screen.width,
      height: window.screen.height
    },
    humanized_target: function() {
      if(this.target !== null) {
        return this.types[this.target]
      } else {
        return "Unknown"
      }
    }
  },

  init() {
    // Setup Current User Device Info
    this.device.target = this.device_detector()

    // Enables Debug
    if(this.debug) {
      console.log(this.device.view_ports.current(this))
      this.enable_debug(this.device.view_ports.current(this))
    }

    // Rate Limit Config
    const rate_limit_tokens   = 10
    const rate_limit_interval = 10000
    const limiter = new RateLimiter({ 
      tokensPerInterval: rate_limit_tokens, 
      interval: rate_limit_interval 
    });

    // Current Website Information
    const website = {
      host: window.location.host,
      path: window.location.pathname,
    }

    // Create Global Talio Structure
    window.talio = {
      userInfo: {},
      pageInfo: {}
    }

    // Parameters to send to Server
    const params = {
      params: {
        website: website
      }
    }

    // Connect to Talio WebSocket Endpoint
    const socket = this.connect(params)

    const branch_channel = this.establish_branch_channel(socket)


    // Connect to Pre-Defined Channels
    const click_channel = this.establish_click_channel(socket)

    // // const refresh_nonce = this.refresh_nonce(click_channel)


    // // Define Current Branch And Send Branch to Server
    const { fingerprint } = this.generate_branch()
    this.page.branch.fingerprint = fingerprint

    // Capture Clicks And Send Them Through WebSocket
    document.addEventListener("click", async e => {
      // const remainingMessages = await limiter.removeTokens(1);
      // console.log(remainingMessages)
      // if(remainingMessages > 0) {
        if(this.branch_status) {
          this.capture_click(e, click_channel)
        }
      // }
    })

  },

  establish_branch_channel(socket) {
    const { fingerprint } = this.generate_branch()
    let branch_channel = socket.channel("branch:" + fingerprint, {})

    // 
    // Channel Hooks
    // 

    // Define Talio User ID Hook
    branch_channel.on("initialize_user", response => {
      console.log(response)
      const nonce = response.nonce
      branch_channel.push("store_branch", {fingerprint: fingerprint, nonce: nonce}, 10000)
        .receive("ok", _response => {
          this.branch_status = true 
        })
      this.initialize_user(response)
    })

    // Socket Terminator Hook
    branch_channel.on("end_session", response => {
      console.log("Terminating connection")
      this.terminated = true
      branch_channel.leave()
    })

    // Default Hooks
    branch_channel.join()
      .receive("ok", ({messages}) => console.log("catching up", messages) )
      .receive("error", ({reason}) => console.log("failed join", reason) )
      .receive("timeout", () => console.log("Networking issue. Still waiting..."))

    return branch_channel
  },


  refresh_nonce(branch_channel) {
    setInterval(
      branch_channel.push("refresh_nonce", {}, 10000)
        .receive("ok", response => {
          console.log(response)
        })
      , 1000)
  },





  // Clicks Columns:
  // 
  // ID | x_cordinate | y_cordinate | element_width | element_height | element_x_cordinate | element_y_cordinate | path(index) | branch_id(index) | device_target(index) | tag_name(index) | talio_user_id(index) | insreted_at | updated_at

  capture_click(event, click_channel) {
    const element_boundings = event.target.getBoundingClientRect()
    console.log(event)
    const raw_payload = {
      metadata: {
        // // Current User Nonce
        // nonce: window.talio.userInfo.nonce,

        // Device Type
        device: this.device.target,
      },

      branch: {
        fingerprint: this.page.branch.fingerprint
      },

      click: {
        // Client Mouse Click In X Axis
        x: event.clientX,
        // Client Mouse Click In Y Axis
        y: event.clientY,
      },

      element: {
        height:   element_boundings.height,
        width:    element_boundings.width,
        x:        element_boundings.x,
        y:        element_boundings.y,
        top:      element_boundings.top,
        bottom:   element_boundings.bottom,
        right:    element_boundings.right,
        left:     element_boundings.left,
        tag_name: event.target.tagName,
        path:     this.css_path(event.target), 
      },
    }

    // Send Payload(Click) To Server
    this.push_click(event.target, raw_payload, click_channel)
  },

  // Send Payload(Click) To Server
  push_click(target, raw_payload, click_channel) {
    // if(this.terminated) {
    //   return;
    // }
    const payload = this.adjust_payload(target, raw_payload)
    console.log(payload)
    click_channel.push("store_click", payload, 10000)
      .receive("ok", response => {
        console.log("Store Click: ", response)
      })
  },

  enable_debug(view_port) {
    const view_port_border = document.createElement("div")
    const top              = 0
    const right            = this.device.screen.width - view_port.width 

    view_port_border.style.outline   = "1px solid red"
    view_port_border.style.position = "absolute"
    view_port_border.style.zIndex = "-1"
    view_port_border.style.width    = view_port.width + "px"
    view_port_border.style.height    = "100%"

    if(view_port.target === "desktop") {
      view_port_border.style.right    = right/2 + "px"
      view_port_border.style.left    = right/2 + "px"
    }
    view_port_border.style.top      = top + "px"

    // TODO: REMOVE
    document.body.appendChild(view_port_border)
  },

  adjust_payload(target, raw_payload) {
    const payload = raw_payload
    const element = payload.element
    const new_element = {}
    const view_port = this.device.view_ports.current(this)
    const pre_defined_width = view_port.width

    payload.metadata.device = view_port.device

    let adjusted_x

    // Resize Measure
    let right = 0;

    // Right Offset Only For Desktop And Higher Devices
    if(view_port.target === "desktop") {
      right = Math.max(0, this.device.screen.width - view_port.width)
    }
    
    // Range of Resizing
    const ranges = { 
      x1: right/2, 
      x2: pre_defined_width 
    }

    // Resize Outer Range Clicks
    if(raw_payload.click.x > ranges.x2 || raw_payload.click.x < ranges.x1) {
      adjusted_x = raw_payload.click.x - pre_defined_width
      adjusted_x = pre_defined_width - adjusted_x

      // Change Raw Payload Click in X axis
      payload.click.x = adjusted_x
    }

    const temp_element_styles = window.getComputedStyle(target)
    const margin_right = parseFloat(temp_element_styles["marginRight"])
    const margin_left = parseFloat(temp_element_styles["marginLeft"])

    element.width = (element.width - (window.innerWidth - pre_defined_width))
    element.right = element.right - margin_right
    element.left = (element.left + right/2) - margin_left

    return payload
  },










  // Create a Socket Object
  connect(params = {params: {}}) {
    const socket = new Socket(this.socket_base_addr + '/socket', params)

    // Connect to ws endpoint
    socket.connect()

    // Hooks
    socket.onOpen( () => {
      console.log("Talio:", "Socket was opened")
    })

    socket.onClose( (message) => {

      // // Gracefully shut down the socket
      // if(message.type === "close") {
      //   socket.disconnect(() => {
          console.log("Talio:", "Socket connection dropped")
      //   }, 1000)
      // }
    })

    // socket.onMessage( (message) => {
    //   console.log("Talio:", "MESSAGE:",message)
    // })

    return socket
  },

  // Connects To Pre Defined Channels 
  establish_click_channel(socket) {
    let click_channel = socket.channel("click:public", {})

    // 
    // Channel Hooks
    // 

    // Default Hooks
    click_channel.join()
      // .receive("ok", ({messages}) => console.log("catching up", messages) )
      .receive("error", ({reason}) => console.log("failed join", reason) )
      .receive("timeout", () => console.log("Networking issue. Still waiting..."))

    return click_channel
  },

  // Assigns Current User Information From Server
  initialize_user(response) {
    window.talio.userInfo.id = response.talio_user_id
    window.talio.userInfo.nonce = response.nonce
    this.nonce = response.nonce
  },

  // Returns an unique hash(murmurhash v3) from parsed html of document
  generate_branch(seed = "0") {
    const html = window.document.documentElement
    const parser = new DOMParser()    
    // Generate a Temporary DOM
    const html_document = parser.parseFromString(html.innerHTML, "text/html")

    // Remove Unnecessary Elements From Temporary DOM
    const tags = [
      "script", // Reason: Browser Add-ons
      "style",  // Reason: Browser Add-ons
      "meta"    // Reason: Browser Add-ons
    ]
    tags.forEach(tag => {
      Array.from(html_document.querySelectorAll(tag)).forEach(script => {
        script.remove()
      })
    })

    return {
      fingerprint: murmurhash.v3(html_document.documentElement.innerHTML, seed)
    }
  },

  // Detect Device By User Agent
  device_detector() {
    var user_agent = navigator.userAgent.toLowerCase();
    user_agent = user_agent.toLowerCase() 
    if(/(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/.test(user_agent)) {
      return 1 // Tablet
    } else {
      if(/(mobi|ipod|phone|blackberry|opera mini|fennec|minimo|symbian|psp|nintendo ds|archos|skyfire|puffin|blazer|bolt|gobrowser|iris|maemo|semc|teashark|uzard)/.test(user_agent)) { 
        return 2 // Mobile
      } else {
        return 0 // Desktop
      }    
    }
  },

  css_path(el) {
    if (!(el instanceof Element)) 
      return;
    var path = [];
    while (el.nodeType === Node.ELEMENT_NODE) {
      var selector = el.nodeName.toLowerCase();
      if (el.id) {
        selector += '#' + el.id;
        path.unshift(selector);
        break;
      } else {
        var sib = el, nth = 1;
        while (sib = sib.previousElementSibling) {
          if (sib.nodeName.toLowerCase() == selector)
            nth++;
        }
        if (nth != 1)
          selector += ":nth-of-type("+nth+")";
      }
      path.unshift(selector);
      el = el.parentNode;
    }
    return path.join(" > ");
  }
}

Talio.init()



// var a = "html > body > p"
// var b = "html > body > p > span"
// var c = "html > body"

// var entries = [a, a, b, b, b, c]
// // entries.forEach(entry => {
// //   console.log(entry.split(" > "))
// // })

// var counts = {};
// entries.forEach(x => { 
//   counts[x] = (counts[x] || 0)+1; 
// });

// for( var key in counts) {
//   console.log("key", key, "value", counts[key])
//   const element_init_style = {
//     border: "1px solid red",
//     background: "cyan"
//   }
//   const element_hover_style = {
//     color: "white",
//     background: "black"
//   }
//   var element = document.querySelector(key)
//   if(element) {
//     Object.assign(element.style, element_init_style)
//     element.addEventListener('mouseover', event => {
//       const element_css_path = Talio.css_path(event.target)
//       const element_click_counts = counts[element_css_path]
//       // Log
//       console.log("\"" + element_css_path + "\" has " + element_click_counts + " clicks")
//     })

//     // Styles
//     element.addEventListener('mouseover', event => {
//       Object.assign(event.target.style, element_hover_style)
//     })
//     element.addEventListener('mouseout', event => {
//       Object.assign(event.target.style, element_init_style)
//     })

//   }
// }
