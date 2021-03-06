import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import { WebLinksAddon } from 'xterm-addon-web-links'
// import { useToast } from '@chakra-ui/toast'
import { useColorModeValue } from '@chakra-ui/color-mode'

const TerminalComponent = ({ closeTerminal }) => {
  // const toast = useToast()
  // if (!toast.isActive('tToast')) {
  //   toast({ id: 'tToast', title: 'terminal opened!', duration: 1000 })
  // }

  const onClose = closeTerminal
  const baseTheme = {
    foreground: '#000000',
    background: '#f9f9f9',
    selection: '#a0a1a7',
    black: '#1E1E1D',
    brightBlack: '#262625',
    red: '#CE5C5C',
    brightRed: '#d52753',
    green: '#5BCC5B',
    brightGreen: '#23974a',
    yellow: '#CCCC5B',
    brightYellow: '#c5a332',
    blue: '#5D5DD3',
    brightBlue: '#0098dd',
    magenta: '#BC5ED1',
    brightMagenta: '#E572FF',
    cyan: '#5DA5D5',
    brightCyan: '#7a82da',
    white: '#F8F8F8',
    brightWhite: '#FFFFFF'
  }
  // vscode-snazzy https://github.com/Tyriar/vscode-snazzy
  const otherTheme = {
    foreground: '#eff0eb',
    background: '#282a36',
    selection: '#97979b33',
    black: '#282a36',
    brightBlack: '#686868',
    red: '#ff5c57',
    brightRed: '#ff5c57',
    green: '#5af78e',
    brightGreen: '#5af78e',
    yellow: '#f3f99d',
    brightYellow: '#f3f99d',
    blue: '#57c7ff',
    brightBlue: '#57c7ff',
    magenta: '#ff6ac1',
    brightMagenta: '#ff6ac1',
    cyan: '#9aedfe',
    brightCyan: '#9aedfe',
    white: '#f1f1f0',
    brightWhite: '#eff0eb'
  }
  // const isBaseTheme = true

  const thisTheme = useColorModeValue(baseTheme, otherTheme)
  const router = useRouter()
  const { locale } = router

  useEffect(() => {
    const term = new Terminal({
      fontFamily: '"Cascadia Code", Menlo, monospace',
      theme: thisTheme,
      cursorBlink: true,
      rows: 20,
      cursorStyle: 'underline'
    })
    const fitAddon = new FitAddon()
    const webLink = new WebLinksAddon()
    term.loadAddon(webLink)
    term.loadAddon(fitAddon)

    const terminalEl = document.getElementById('terminal')
    if (!terminalEl.classList.contains('loaded')) {
      term.open(terminalEl)
      terminalEl.classList.add('loaded')
      fitAddon.fit()
      document.querySelector('.xterm-helper-textarea').focus()
    }

    const isWebglEnabled = false
    try {
      const webgl = new window.WebglAddon.WebglAddon()
      term.loadAddon(webgl)
      isWebglEnabled = true
    } catch (e) {
      console.warn('WebGL addon threw an exception during load', e)
    }

    // Cancel wheel events from scrolling the page if the terminal has scroll back
    document.querySelector('.xterm').addEventListener('wheel', e => {
      if (term.buffer.active.baseY > 0) {
        e.preventDefault()
      }
    })

    function runFakeTerminal() {
      if (term._initialized) {
        return
      }
      term._initialized = true

      term.prompt = () => {
        command = ''
        const time = new Date(Date.now())
        term.write(
          '\r\n' +
            '\x1b[36;1m@Oizys18\x1b[0m [' +
            time.getHours() +
            ':' +
            time.getMinutes() +
            ']'
        )
        term.write('\r\n$ ')
      }

      // Welcome message
      term.welcome = () => {
        const welcome = {
          ko: [
            '  \x1b[31;1mHello World!',
            '  \x1b[34;1m????????? - Portfolio Website\x1b[0m ',
            ' ??? \x1b[1mFeatures\x1b[0m ???????????????????????????????????????????????????',
            // ' ???                          ???',
            ' ???  \x1b[31;1m??? ????????????\x1b[0m             ???',
            ' ???  - Github ?????? ??????????????????',
            ' ???                          ???',
            ' ???  \x1b[32;1m?????? ????????????\x1b[0m           ???',
            ' ???  - ?????? ?????? ??? ?????????   ???',
            ' ???                          ???',
            ' ???  \x1b[33;1mUI ????????????\x1b[0m             ???',
            ' ???  - ?????? UI ???????????????    ???',
            ' ????????????????????????????????????????????????????????????????????????????????????'
          ],
          en: [
            '  \x1b[31;1mHello World!',
            '  \x1b[34;1mYangChanWoo - Portfolio Website\x1b[0m ',
            ' ??? \x1b[1mFeatures\x1b[0m ???????????????????????????????????????????????????',
            ' ???  \x1b[31;1mTeam Project\x1b[0m            ???',
            ' ???  - Github Public projects???',
            ' ???                          ???',
            ' ???  \x1b[32;1mToy Projects\x1b[0m            ???',
            ' ???  - Study & Practice      ???',
            ' ???                          ???',
            ' ???  \x1b[33;1mUI Components\x1b[0m           ???',
            ' ???  - Small UI components   ???',
            ' ????????????????????????????????????????????????????????????????????????????????????'
          ]
        }
        term.writeln([...welcome[locale]].join('\n\r'))
      }
      term.welcome()
      const welcomeMessage = {
        ko: '  Welcome! \r\n  ????????? \x1b[31;1mhelp\x1b[0m??? ??????????????????',
        en: '  Welcome! \r\n  Try out \x1b[31;1mhelp\x1b[0m'
      }
      term.writeln(welcomeMessage[locale])
      term.prompt()
      term.onData(e => {
        switch (e) {
          case '\x1B':
            onClose()
            break
          case '\u0003': // Ctrl+C
            term.clear()
            term.write('^C')
            term.prompt()
            break
          case '\r': // Enter
            term.clear()
            runCommand(term, command)
            command = ''
            break
          case '\u007F': // Backspace (DEL)
            // Do not delete the prompt
            if (term._core.buffer.x > 2) {
              term.write('\b \b')
              if (command.length > 0) {
                command = command.substr(0, command.length - 1)
              }
            }
            break
          default:
            // Print all other characters for demo
            if (
              (e >= String.fromCharCode(0x20) &&
                e <= String.fromCharCode(0x7b)) ||
              e >= '\u00a0'
            ) {
              command += e
              term.write(e)
              return false
            }
        }
      })

      // Create a very simple link provider which hardcodes links for certain lines
      // term.registerLinkProvider({
      //   provideLinks(bufferLineNumber, callback) {
      //     switch (bufferLineNumber) {
      //       case 3:
      //         callback([
      //           {
      //             text: 'Hello',
      //             range: { start: { x: 2, y: 19 }, end: { x: 9, y: 19 } },
      //             activate() {
      //               window.open('https://github.com/microsoft/vscode', '_blank')
      //             }
      //           }
      //           // {
      //           //   text: 'Hyper',
      //           //   range: { start: { x: 37, y: 2 }, end: { x: 41, y: 2 } },
      //           //   activate() {
      //           //     window.open('https://github.com/vercel/hyper', '_blank')
      //           //   }
      //           // },
      //           // {
      //           //   text: 'Theia',
      //           //   range: { start: { x: 47, y: 2 }, end: { x: 51, y: 2 } },
      //           //   activate() {
      //           //     window.open(
      //           //       'https://github.com/eclipse-theia/theia',
      //           //       '_blank'
      //           //     )
      //           //   }
      //           // }
      //         ])
      //         return
      //       case 8:
      //         callback([
      //           {
      //             text: 'WebGL renderer',
      //             range: { start: { x: 54, y: 8 }, end: { x: 67, y: 8 } },
      //             activate() {
      //               window.open(
      //                 'https://npmjs.com/package/xterm-addon-webgl',
      //                 '_blank'
      //               )
      //             }
      //           }
      //         ])
      //         return
      //       case 14:
      //         callback([
      //           {
      //             text: 'Links',
      //             range: { start: { x: 45, y: 14 }, end: { x: 49, y: 14 } },
      //             activate() {
      //               window.alert('You can handle links any way you want')
      //             }
      //           },
      //           {
      //             text: 'themes',
      //             range: { start: { x: 52, y: 14 }, end: { x: 57, y: 14 } },
      //             activate() {
      //               isBaseTheme = !isBaseTheme
      //               term.setOption(
      //                 'theme',
      //                 isBaseTheme ? baseTheme : otherTheme
      //               )
      //               document
      //                 .querySelector('.demo .inner')
      //                 .classList.toggle('other-theme', !isBaseTheme)
      //               term.write(
      //                 `\r\nActivated ${
      //                   isBaseTheme ? 'xterm.js' : 'snazzy'
      //                 } theme`
      //               )
      //               prompt(term)
      //             }
      //           },
      //           {
      //             text: 'addons',
      //             range: { start: { x: 60, y: 14 }, end: { x: 65, y: 14 } },
      //             activate() {
      //               window.open('/docs/guides/using-addons/', '_blank')
      //             }
      //           },
      //           {
      //             text: 'typed API',
      //             range: { start: { x: 68, y: 14 }, end: { x: 76, y: 14 } },
      //             activate() {
      //               window.open(
      //                 'https://github.com/xtermjs/xterm.js/blob/master/typings/xterm.d.ts',
      //                 '_blank'
      //               )
      //             }
      //           }
      //         ])
      //         return
      //     }
      //     callback(undefined)
      //   }
      // })
    }

    // ???????????? ??????
    const projects = {
      wave: {
        title: 'JS canvas Wave',
        link: 'https://github.com/Oizys18/toy_projects/tree/master/wave',
        description: {
          ko: [
            'Interactive designer?????? ????????? ????????? ??? canvas ????????? ?????? ????????? ????????????',
            'Class??? Wave??? ?????????, WaveGroup?????? ????????? HTML canvas??? ?????????.',
            'wave ????????? point??? ????????? ????????? ????????? ??? ??????.'
          ],
          en: [
            'Project to study HTML5 canvas, studied with the video of @Interactive Designer',
            'Makes Wave instance with JS class, group by wave group and draw on HTML canvas',
            'The waves can be controlled with wave count and points'
          ]
        },
        created_at: '2021.03'
      },
      video: {
        title: 'Browser Video Editor',
        link: 'https://github.com/Oizys18/video_editor',
        description: {
          ko: [
            'ffmpeg + HTML5 video player??? ????????? ????????? ?????????????????? ?????? ?????? ??? ???????????? ????????????',
            '?????? ?????? ????????? ??????, ?????? ?????? ?????? ??? ????????? ??????, ?????? ??? ?????? ??????',
            '?????? ?????? ?????? ?????? ??? ????????? ???????????? ?????? ??????/???????????? ???????????? ????????????.'
          ],
          en: [
            'ffmpeg + HTML5 video player to crop and save video in browser',
            'Load video and measure the length, crop the video with user setting',
            'You can add more codecs and commands to encode the video'
          ]
        },
        created_at: '2021.12'
      },
      gallery: {
        title: 'UI components',
        link: '',
        description: {
          ko: [
            '?????? ???????????? ?????? ??? ???????????? ?????? UI ???????????????',
            '?????????????????? ???????????? ?????????, ??? ????????? ????????? ????????? ????????? ??????',
            '?????? ????????? ?????????????????????.'
          ],
          en: [
            'Various UI components made during several projects',
            'Coded from zero for better control over style & operation'
          ]
        },
        created_at: '2020 ~ 2021'
      },
      burger: {
        title: 'Bouncy Burger',
        link: 'https://github.com/Oizys18/GREAT',
        description: {
          ko: [
            'GrEat ??????????????? ??? ?????????????????? ?????? ????????? Interactive Image',
            '?????? ????????? ???????????? x,y ????????? ????????? ????????? ???????????? ????????????.'
          ],
          en: [
            'Interactive Image made while participating in GrEAT Team Project.',
            'Made for Landing Page style',
            'Moves Hamburger Image according to the x,y coordinate of mouse pointer'
          ]
        },
        created_at: '2020.05'
      },
      pixel: {
        title: 'Pixel Art Maker',
        link: 'https://github.com/Oizys18/GREAT',
        description: {
          ko: [
            'GrEat ??????????????? ??? ?????????????????? ?????? ????????? Interactive Image',
            '?????? ????????? ???????????? x,y ????????? ????????? ????????? ???????????? ????????????.'
          ],
          en: [
            'Interactive Image made while participating in GrEAT Team Project.',
            'Made for Landing Page style',
            'Moves Hamburger Image according to the x,y coordinate of mouse pointer'
          ]
        },
        created_at: '2022.02'
      }
    }

    // ????????? ??????
    var command = ''
    const commands = {
      home: {
        f: () => {
          router.push('/', '/', { shallow: true })
          term.prompt()
        },
        description: `${locale === 'ko' ? '??????????????????' : 'To IndexPage'}`
      },
      close: {
        f: () => {
          onClose()
        },
        description: `${locale === 'ko' ? '????????? ??????' : 'Close Terminal'}`
      },
      help: {
        f: () => {
          term.writeln(
            [
              `${
                locale === 'ko'
                  ? '??????????????? ????????? ???????????????'
                  : 'Welcome to this.self Portfolio'
              }`,
              `${
                locale === 'ko'
                  ? '?????? ???????????? ??????????????????'
                  : 'Try out commands below'
              }`,
              '',
              ...Object.keys(commands)
                .filter(e => e != 'show')
                .map(
                  e =>
                    ` \x1b[34;1m${e.padEnd(11)}\x1b[0m  ${
                      commands[e].description
                    }`
                ),
              ` \x1b[34;1m${'show [name]'.padEnd(11)}\x1b[0m  ${
                commands['show'].description
              }`
            ].join('\n\r')
          )
          term.prompt()
        },
        description: `${
          locale === 'ko' ? 'help ????????? ??????' : 'Print out help message'
        }`
      },
      projects: {
        f: () => {
          term.writeln(
            [
              ...Object.keys(projects).map(
                e => ` ${e.padEnd(10)} ${projects[e]['title']}`
              )
            ].join('\r\n')
          )
          term.prompt()
        },
        description: `${
          locale === 'ko' ? '???????????? ????????? ??????' : 'Check Project list'
        }`
      },
      show: {
        f: project => {
          if (!project) {
            term.writeln('Please input project name')
            term.prompt()
          } else if (project == 'sth') {
            term.writeln('sth is not a project.....')
            term.writeln('Try proper project name!')
            term.prompt()
          } else if (project in projects) {
            router.push(`/projects/${project}`, `/projects/${project}`, {
              shallow: true
            })
            term.writeln(
              [
                `  \x1b[32;1m${projects[project]['title']}\x1b[0m - ${projects[project]['created_at']}`,
                `  Link: ${projects[project]['link']}`,
                '',
                ...projects[project]['description'][`${locale}`].map(
                  e => `  ${e}`
                )
              ].join('\r\n')
            )
            term.prompt()
          } else {
            term.writeln(`${project}: project not found`)
            term.prompt()
          }
        },
        description: `${locale === 'ko' ? '???????????? ??????' : 'Check Project'}`
      },
      platform: {
        f: () => {
          term.writeln(
            [
              `${locale === 'ko' ? '???????????? ?????????' : 'Browser support'}`,
              ' \x1b[32;1mSafari\x1b[0m: version 9 or later',
              ' \x1b[32;1mChrome\x1b[0m: version 67 or later',
              ' \x1b[32;1mFirefox\x1b[0m: version 65 or later',
              ' \x1b[32;1mEdge\x1b[0m: version 17 or later',
              ' \x1b[32;1mOpera\x1b[0m: version 50 or later',
              ' \x1b[32;1mIE\x1b[0m: version 11 or later, but buggy'
            ].join('\r\n')
          )
          term.prompt()
        },
        description: `${
          locale === 'ko' ? '?????? ?????????' : 'Supporting Platforms'
        }`
      }
    }

    function runCommand(term, text) {
      const texts = text.trim().split(' ')
      const command = text.trim().split(' ')[0]
      if (command.length > 0) {
        term.writeln('')
        if (command in commands) {
          if (texts.length == 2) {
            commands[command].f(texts[1])
          } else {
            commands[command].f()
          }
          return
        }
        term.writeln(`${command}: command not found`)
      }
      term.prompt()
    }

    runFakeTerminal()
  }, [])

  return <div id="terminal" />
}

export default TerminalComponent
