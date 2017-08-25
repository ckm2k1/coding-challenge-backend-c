let userLocation = null;

class SearchBox extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      suggestions: [],
      open: false,
      value: ''
    };

    this.handleChange = this.handleChange.bind(this);
  }

  async handleChange(event) {
    const value = event.target.value;

    if (value && value.length > 3) {
      let apiUrl = `/suggestions?q=${encodeURIComponent(event.target.value)}`;
      if (userLocation) {
        apiUrl = `${apiUrl}&lat=${userLocation.lat}&long=${userLocation.long}`;
      }
      const res = await fetch(apiUrl);
      const json = await res.json();

      if (json && json.suggestions.length) {
        this.setState({
          suggestions: json.suggestions,
          open: true
        });
      }
    }

    this.setState({ value });
  }

  render() {
    return React.createElement(
      "div",
      null,
      React.createElement("input", { type: "text", className: "search-box", onChange: this.handleChange, value: this.state.value, autoFocus: true }),
      React.createElement(SuggestionsDropDown, { className: 'suggestions-dropdown' + (this.state.open ? 'show' : ''), suggestions: this.state.suggestions })
    );
  }
}

class SuggestionsDropDown extends React.Component {
  render() {
    const children = this.props.suggestions.map(s => {
      const coords = s.distance !== null ? `(${s.distance}km)` : `(${s.lat.toFixed(2)}, ${s.long.toFixed(2)})`;

      return React.createElement(
        "li",
        { className: "suggestions-item", key: s.id },
        s.name,
        ", ",
        s.stateOrProvince,
        ", ",
        s.country,
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

document.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(React.createElement(SearchBox, {}, null), document.getElementById('root'));

  navigator.geolocation.getCurrentPosition(response => {
    userLocation = {
      lat: response.coords.latitude,
      long: response.coords.longitude
    };
  });
});