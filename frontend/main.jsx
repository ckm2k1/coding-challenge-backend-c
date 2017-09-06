let userLocation = null;

// Round floats to 2 decimal places. We do this because
// the server caches hits using coords and we don't want a single
// digit difference in the coords to cause a new cache entry.
function roundToTwo(num) {
    return +(Math.round(num + 'e+2')  + 'e-2');
}

class BreakdownDrawer extends React.Component {
  render() {
    const visibilityClass = this.props.visible ? '' : 'hidden';

    return (
      <div className={['breakdown', visibilityClass].join(' ')}>
        <span>Population: {this.props.pscore.toFixed(2)}, ({this.props.popl.toLocaleString()})</span>
        <span>Distance: {this.props.distance.toFixed(2)}</span>
        <span>Jaro-Winkler: {this.props.ldist.toFixed(2)}</span>
      </div>
    );
  }
}


class SuggestionItem extends React.Component {
  constructor(props) {
    super(props);

    this.handleScoreClick = this.handleScoreClick.bind(this);

    this.state = {
      showDrawer: false
    }
  }

  handleScoreClick(event) {
    this.setState((prevState) => {
      return {showDrawer: !prevState.showDrawer};
    });
  }

  render() {
    const coords = this.props.distance !== null ?
      `(${this.props.distance}km)` :
      `(${this.props.lat.toFixed(2)}, ${this.props.long.toFixed(2)})`;

    return (<li className="suggestions-item">
      <span className="score" onClick={this.handleScoreClick}>
        {(this.props.score * 100).toFixed(2)}%
      </span>

      <span className="content">
        {this.props.name}, {this.props.stateOrProvince}, {this.props.country}
      </span>

      <span className="coords">{coords}</span>

      <BreakdownDrawer
        visible={this.state.showDrawer}
        distance={this.props.comps.distance}
        popl={this.props.population}
        pscore={this.props.comps.population}
        ldist={this.props.comps.ldist}
      />
    </li>);
  }
}

class SuggestionsDropDown extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const children = this.props.suggestions.map(s => {
      return (
        <SuggestionItem {...s} key={s.id} />
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
      suggestions: []
    };

    this.handleChange = this.handleChange.bind(this);
    this._debouncedOnChange = _.debounce(this._debouncedOnChange.bind(this), 100);
  }

  async handleChange(event) {
    event.persist();
    this._debouncedOnChange(event.target.value);
  }

  async _debouncedOnChange(value) {
    if (value && value.length >= 3) {
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
    return (<div>
      <input type="text" className="search-box" onChange={this.handleChange} autoFocus />
      <SuggestionsDropDown className={'suggestions-dropdown' + (this.state.open ? 'show' : '')} suggestions={this.state.suggestions} />
    </div>)
  }
}

/**
 * Main app component used to load user location and
 * show loading screen.
 */
class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      dots: '',
      timer: null,
      dotUpdateInterval: 400 //in milli.
    };
  }

  updateDots() {
    this.setState((prevState) => {
      const dotLength = prevState.dots.length;
      return {
        dots: dotLength === 3 ? '' : prevState.dots + '.'
      };
    });
  }

  componentDidMount() {
    navigator.geolocation.getCurrentPosition(response => {
      userLocation = {
        lat: roundToTwo(response.coords.latitude),
        long: roundToTwo(response.coords.longitude)
      };

      this.setState({
        loading: false
      });
    }, () => {
      this.setState({
        loading: false
      });
    });

    if (!this.state.timer) {
      this.setState({
        timer: setInterval(this.updateDots.bind(this), this.state.dotUpdateInterval)
      });
    }
  }

  componentWillUnmount() {
    clearInterval(this.state.timer);
  }

  render() {
    if (this.state.loading) {
      return (
        <div className="loading">
          <span>Geolocating, please hold{this.state.dots || '\u00a0'}</span>
        </div>
      );
    }

    return (<SearchBox />);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(React.createElement(App, {}, null), document.getElementById('root'));
});
