import { Socket } from 'phoenix'
import { RateLimiter } from "limiter";

const murmurhash = require('murmurhash')

// Define talio object
window.talio = {}

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

  // Current Website Information
  website: {
    // Responsiveness status of current website
    // Default to `true` because in database it
    // is set to `true` as well.
    is_responsive: true
  },

  // Device Information
  device: {
    // View Ports
    view_ports: {
      // Return Current View Port
      current: function(__MODULE__) {
        const view_port = {}
        
        // Based On Responsiveness of Device Screen
        if(document.body.clientWidth >= __MODULE__.device.view_ports.desktop.width) {
          view_port.target = "desktop"
          view_port.device = 0
          view_port.width = __MODULE__.device.view_ports.desktop.width
        }
        if(document.body.clientWidth <= __MODULE__.device.view_ports.tablet.width ||
          document.body.clientWidth <= __MODULE__.device.view_ports.desktop.width) {
          view_port.target = "tablet"
          view_port.device = 1
          view_port.width = __MODULE__.device.view_ports.tablet.width
        }
        if(document.body.clientWidth <= __MODULE__.device.view_ports.mobile.width) {
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
    // // Touch screen settings (Don't need it)
    // touch: {
    //   offset: null
    // },
    humanized_target: function() {
      if(this.target !== null) {
        return this.types[this.target]
      } else {
        return "Unknown"
      }
    }
  },

  init() {
    // Setup touch screen settings
    const view_port = this.device.view_ports.current(this)

    // Setup Current User Device Info
    this.device.target = this.device_detector()

    // Enables Debug
    if(this.debug) {
      console.log(this.device.view_ports.current(this))
      this.enable_debug(this.device.view_ports.current(this))
    }

    // // Rate Limit Config
    // const rate_limit_tokens   = 10
    // const rate_limit_interval = 10000
    // const limiter = new RateLimiter({ 
    //   tokensPerInterval: rate_limit_tokens, 
    //   interval: rate_limit_interval 
    // });

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

    // Define Current Branch And Send Branch to Server
    const { fingerprint } = this.generate_branch()
    this.page.branch.fingerprint = fingerprint
    console.log('Branch:', fingerprint)
    const branch_channel = this.establish_branch_channel(socket, fingerprint)

    // Connect to Pre-Defined Channels
    const click_channel = this.establish_click_channel(socket)

    // // // const refresh_nonce = this.refresh_nonce(click_channel)

    // Capture Clicks And Send Them Through WebSocket
    document.addEventListener("click", async e => {
      // const remainingMessages = await limiter.removeTokens(1);
      // console.log("Remained clicks:", remainingMessages)
      // // Limit the clicks
      // if(remainingMessages > 0) {
        // if(this.branch_status) {
          this.capture_click(e, click_channel)
        // }
      // }
    })
  },

  establish_branch_channel(socket, fingerprint) {
    let branch_channel = socket.channel("branch:" + fingerprint, {})

    // 
    // Channel Hooks
    // 

    branch_channel.on("initialize_website", response => {
      console.log(response)
      this.website.is_responsive = response.is_responsive
    })

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
      // .receive("ok", ({messages}) => console.log("catching up", messages) )
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

  capture_click(event, click_channel) {
    console.log(event)
    const element_boundings = event.target.getBoundingClientRect()
    const raw_payload = {
      metadata: {
        // // Current User Nonce (Currently we don't need it)
        // nonce: window.talio.userInfo.nonce,

        // Device Type
        device: this.device.target,
      },

      branch: {
        fingerprint: this.page.branch.fingerprint
      },

      // We use `page(X/Y)` instead of `client(X/Y)`
      // because `clientY` does not calculate page scroll
      click: {
        // Client Mouse Click In X Axis
        x: event.pageX,
        // Client Mouse Click In Y Axis
        y: event.pageY,
      },

      // We only need the path of current element
      element: {
        path:     this.css_path(event.target), 
      },
    }

    // Send Payload(Click) To Server
    this.push_click(event.target, raw_payload, click_channel)
  },

  // Send Payload(Click) To Server
  push_click(target, raw_payload, click_channel) {
    // Do not push the clicks when socket is terminated
    if(this.terminated) {
      return;
    }
    const payload = this.adjust_payload(target, raw_payload)
    console.log("Payload:", payload)
    // Send the click payload to the socket server
    click_channel.push("store_click", payload, 10000)
      .receive("ok", response => {
        console.log("Store Click: ", response)
      })
  },

  // // TODO: No need it, because it will cause problems
  // enable_debug(view_port) {
  //   const view_port_border = document.createElement("div")
  //   const top              = 0
  //   const right            = this.device.screen.width - view_port.width 

  //   view_port_border.style.outline   = "1px solid red"
  //   view_port_border.style.position = "fixed"
  //   view_port_border.style.zIndex = "9999"
  //   view_port_border.style.width    = view_port.width + "px"
  //   view_port_border.style.height    = "100%"

  //   if(view_port.target === "desktop") {
  //     view_port_border.style.right    = right/2 + "px"
  //     view_port_border.style.left    = right/2 + "px"
  //   }
  //   view_port_border.style.top      = top + "px"

  //   // TODO: REMOVE
  //   document.body.appendChild(view_port_border)
  // },

  // // Get padding and margin of an element (Don't need it rn)
  // compute_spaces(element) {
  //   const computed_style = window.getComputedStyle(element, null)
  //   const styles = {}

  //   // Paddings
  //   styles.padding_right  = parseFloat(computed_style.paddingRight)
  //   styles.padding_left   = parseFloat(computed_style.paddingLeft)
  //   styles.padding_top    = parseFloat(computed_style.paddingTop)
  //   styles.padding_bottom = parseFloat(computed_style.paddingBottom)

  //   // Margins
  //   styles.margin_right  = parseFloat(computed_style.marginRight)
  //   styles.margin_left   = parseFloat(computed_style.marginLeft)
  //   styles.margin_top    = parseFloat(computed_style.marginTop)
  //   styles.margin_bottom = parseFloat(computed_style.marginBottom)

  //   return styles
  // },

  adjust_payload(target, raw_payload) {
    console.log("RAW click", raw_payload.click)
    const payload = raw_payload
    const view_port = this.device.view_ports.current(this)
    const pre_defined_width = view_port.width
    // const element_spaces = this.compute_spaces(target)
    
    payload.metadata.device = view_port.device

    let adjusted_x

    // Resize Measure
    let right = 0;

    // Right Offset Only For Desktop And Higher Devices
    // Or if the website is responsive
    if(view_port.target === "desktop" && this.website.is_responsive) {
      right = Math.max(0, this.device.screen.width - pre_defined_width)
    }

    // Range of Resizing
    const ranges = {
      x1: right/2, 
      x2: pre_defined_width 
    }

    // Adjust Desktop screen axis
    if(view_port.target === "desktop") {
      if(raw_payload.click.x < ranges.x1) {
        // Resize Outer Range Clicks (Left side)
        adjusted_x = raw_payload.click.x + right / 2

        // Change Raw Payload Click in X axis
        payload.click.x = adjusted_x
        payload.click.x = payload.click.x - right/2
      } else if(raw_payload.click.x > ranges.x2) {
        // Resize Outer Range Clicks (Right side)
        adjusted_x = raw_payload.click.x - pre_defined_width
        adjusted_x = pre_defined_width - adjusted_x
        adjusted_x = adjusted_x + right / 2

        // Change Raw Payload Click in X axis
        payload.click.x = adjusted_x
        payload.click.x = payload.click.x - right/2
      } else {
        payload.click.x  = Math.floor(this.device.view_ports.desktop.width * payload.click.x / document.body.clientWidth)
      }
    }
    // Adjust touch(Tablet / Mobile) screen axis (Big brain math formula)
    if(view_port.target === "tablet") {
      payload.click.x  = Math.floor(this.device.view_ports.tablet.width * payload.click.x / document.body.clientWidth)
    }
    if(view_port.target === "mobile") {
      payload.click.x  = Math.floor(this.device.view_ports.mobile.width * payload.click.x / document.body.clientWidth)
    }

    console.log(payload.click)
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
        console.log("Talio:", "Socket connection dropped")
        socket.disconnect()
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
      "meta",   // Reason: Browser Add-ons
      "link"    // Reason: Unintentional styles
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

window.talio.instance = Talio
