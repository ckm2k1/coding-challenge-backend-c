let userLocation = null;

class SuggestionsDropDown extends React.Component {
  render() {
    const children = this.props.suggestions.map(s => {
      const coords = s.distance !== null ? `(${s.distance}km)` : `(${s.lat.toFixed(2)}, ${s.long.toFixed(2)})`;

      return (
        <li className="suggestions-item"  key={s.id}>
          <span className="score">{(s.score * 100).toFixed(2)}%</span>
          <span className="content">{s.name}, {s.stateOrProvince}, {s.country}</span>
          <span className="coords">{coords}</span>
        </li>
      );
    });

    return (
      <ul className="suggestions-list">{children}</ul>
    );
  }
}

class SearchBox extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      suggestions: [],
      open: false
    };

    this.handleChange = this.handleChange.bind(this);
    this._debouncedOnChange = _.debounce(this._debouncedOnChange.bind(this), 180);
  }

  async handleChange(event) {
    event.persist();
    this._debouncedOnChange(event.target.value);
  }

  async _debouncedOnChange(value) {
    if (value && value.length > 3) {
      let apiUrl = `/suggestions?q=${encodeURIComponent(value)}`;
      if (userLocation) {
        apiUrl = `${apiUrl}&lat=${userLocation.lat}&long=${userLocation.long}`;
      }

      const res = await fetch(apiUrl);
      const json = await res.json();

      if (json && !json.error) {
        this.setState({
          suggestions: json.suggestions
        });
      }
    } else {
      this.setState({
        suggestions: []
      });
    }

    this.setState({ value });
  }

  render() {
    return (
      <div>
        <input type="text" className="search-box" onChange={this.handleChange} autoFocus />
        <SuggestionsDropDown className={'suggestions-dropdown' + (this.state.open ? 'show' : '')} suggestions={this.state.suggestions} />
      </div>
    );
  }
}

document.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(React.createElement(SearchBox, {}, null), document.getElementById('root'));

  navigator.geolocation.getCurrentPosition(response => {
    userLocation = {
      lat: response.coords.latitude,
      long: response.coords.longitude
    };
  });
});