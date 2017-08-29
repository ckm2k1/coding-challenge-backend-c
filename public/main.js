let userLocation = null;

class SuggestionsDropDown extends React.Component {
  render() {
    const children = this.props.suggestions.map(s => {
      const coords = s.distance !== null ? `(${s.distance}km)` : `(${s.lat.toFixed(2)}, ${s.long.toFixed(2)})`;

      return React.createElement(
        "li",
        { className: "suggestions-item", key: s.id },
        React.createElement(
          "span",
          { className: "score" },
          (s.score * 100).toFixed(2),
          "%"
        ),
        React.createElement(
          "span",
          { className: "content" },
          s.name,
          ", ",
          s.stateOrProvince,
          ", ",
          s.country
        ),
        React.createElement(
          "span",
          { className: "coords" },
          coords
        )
      );
    });

    return React.createElement(
      "ul",
      { className: "suggestions-list" },
      children
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
    return React.createElement(
      "div",
      null,
      React.createElement("input", { type: "text", className: "search-box", onChange: this.handleChange, autoFocus: true }),
      React.createElement(SuggestionsDropDown, { className: 'suggestions-dropdown' + (this.state.open ? 'show' : ''), suggestions: this.state.suggestions })
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