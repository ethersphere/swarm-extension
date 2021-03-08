import React from 'react'
import { getItem, setItem } from '../../utils/storage'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Props {}
interface State {
  beeApiUrl: string
}

class App extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { beeApiUrl: 'http://localhost:1633' }
    this.asyncInit()

    // bindings
    this.handleBzzApiUrlChange = this.handleBzzApiUrlChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  handleBzzApiUrlChange(event: React.ChangeEvent<HTMLInputElement>): void {
    this.setState({ beeApiUrl: event.target.value })
  }

  async handleSubmit(event: React.FormEvent<HTMLElement>): Promise<void> {
    event.preventDefault()
    await setItem('beeApiUrl', this.state.beeApiUrl)
  }

  async asyncInit(): Promise<void> {
    this.setState({ beeApiUrl: await getItem('beeApiUrl') })
  }

  render(): JSX.Element {
    return (
      <form id="form-bee-api-url-change" onSubmit={this.handleSubmit}>
        <label>
          Bee node API address:
          <input type="text" value={this.state.beeApiUrl} onChange={this.handleBzzApiUrlChange} />
        </label>
        <input type="submit" value="Change" />
      </form>
    )
  }
}

export default App
