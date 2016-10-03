import React from 'react';
import {Animated, AsyncStorage, Image, Linking, Platform, ScrollView, StyleSheet, Text,  TextInput, TouchableOpacity, View} from 'react-native';
import { MonoText } from '../components/StyledText';
import appData from '../appData'

export default class HomeScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      email: '',
      photoLink: undefined,
      textEmail:'',
      valuesForPicker: {},
      position: '',
      notification: '',
      lat: '',
      lon: '',
      fade: new Animated.Value(1), // init opacity
    };
  }

  static route = {
    navigationBar: {visible: false}
  }

  render() {
    return (
      <View style={styles.container}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}>

          <View style={styles.welcomeContainer}>
            <Image
              source={require('../assets/images/exponent-wordmark.png')}
              style={styles.welcomeImage}
            />
          </View>


          <View style={styles.getStartedContainer}>
            {this._maybeRenderDevelopmentModeWarning()}

            <Text style={styles.getStartedText}>
              Get started by opening
            </Text>

            <View style={[styles.codeHighlightContainer, styles.homeScreenFilename]}>
              <MonoText style={styles.codeHighlightText}>screens/HomeScreen.js</MonoText>
            </View>

            <Text style={styles.getStartedText}>
              Hi Evlynka
            </Text>
          </View>

          <View style={styles.helpContainer}>
            <TouchableOpacity onPress={this._handleHelpPress} style={styles.helpLink}>
              <Text style={styles.helpLinkText}>
                Help, it didn’t automatically reload!
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <View style={styles.tabBarInfoContainer}>
          <Animated.Text style={[styles.tabBarInfoText,{opacity: this.state.fade}]}>{this.state.notification}</Animated.Text>
        </View>
      </View>
    );
  }

  _maybeRenderDevelopmentModeWarning() {
    if (__DEV__) {
      const learnMoreButton = (
        <Text onPress={this._handleLearnMorePress} style={styles.helpLinkText}>
          Learn more
        </Text>
      );

      return (
        <Text style={styles.developmentModeText}>
          Development mode is enabled, your app will run slightly slower but
          you have access to useful development tools. {learnMoreButton}.
        </Text>
      );
    } else {
      return (
        <Text style={styles.developmentModeText}>
          You are not in development mode, your app will run at full speed.
        </Text>
      );
    }
  }

  signIn() {
    this.setState({errorMessage: null});
    this.state.fade.setValue(1);

    let url = `${appData.urlBase}/users/signin?token=${appData.urlToken}&email=${this.state.email}&password=${this.state.password}`;
    let request = new Request(url, {
      method: 'POST',
      headers: new Headers({'Content-Type': 'text/plain'})
    });
    fetch(request)
      .then((response) => {
        return response.json();
      })
      .then((user) => {
        if (user.error) {
          this.setState({errorMessage: user.error});
          Animated.timing(this.state.fade, {toValue: 0, duration: 3000}).start();
        }
        else {

          // AsyncStorage.setItem('email', user.email)
          // AsyncStorage.setItem('username', user.username)
          // AsyncStorage.setItem('contacts', JSON.stringify(user.contacts))
          //   .then(() => {
          //     this.props.navigator.immediatelyResetRouteStack([{name: 'send'}]);
          //   })

          this.setState({username: user.username, emai: user.email, valuesForPicker: user.contacts})
        }
      })
      .catch(() => {
        this.setState({errorMessage: 'Connection error'});
        Animated.timing(this.state.fade, {toValue: 0, duration: 3000}).start();
      })
  }

  loadUserInfo () {

  }

  componentWillMount() {

  // AsyncStorage.getItem('username')
  //   .then(username => {this.setState({username: username});
  //   });
  // AsyncStorage.getItem('email')
  //   .then(email => {this.setState({email: email});
  //   });
  // AsyncStorage.getItem('contacts')
  //   .then(contacts => {
  //     this.setState({valuesForPicker: JSON.parse(contacts)})
  //   });
  this.signIn.bind(this)
  this.getLocation.bind(this)()
  AsyncStorage.setItem('photoLink', '')
}

  getLocation(args, callback){
    navigator.geolocation.getCurrentPosition(
      (position) => {
        var latitude = position.coords.latitude;
        var longitude = position.coords.longitude;
        this.setState({lat: latitude, lon: longitude})
        var coords = `${latitude} ${longitude}`
        this.translateCoords.bind(this)(coords);
      },
      (error) => alert(error.message),
      {enableHighAccuracy: true, timeout: 30000, maximumAge: 1000}
    );
  }

  translateCoords(coords){
    let url = `${appData.urlBase}/addresses/translateCoords?token=${appData.urlToken}&coords=${coords}`;
    let request = new Request(url, {
      method: 'POST',
      headers: new Headers({'Content-Type': 'text/plain'})
    });
    fetch(request)
      .then((response) => {
        return response.json();
      })
      .then((address) => {
        if (address.error) {
          this.setState({notification: 'translation error'});
          Animated.timing(this.state.fade, {toValue: 0, duration: 3000}).start();
        }
        else {
          this.setState({position: address.streetAddress, notification:'reloaded'})
          Animated.timing(this.state.fade, {toValue: 0, duration: 3000}).start();
        }
      })
      .catch(() => {
        this.setState({notification: 'fetch error'});
        Animated.timing(this.state.fade, {toValue: 0, duration: 3000}).start();
      })
  }

  sendMessage() {
    var address = this.state.position
    var targetEmail = this.state.textEmail
    var userEmail = this.state.email
    var photoLink = this.state.photoLink
    var lat = this.state.lat
    var lon = this.state.lon

    if (!targetEmail) {
      this.setState({notification: 'No email'});
      Animated.timing(this.state.fade, {toValue: 0, duration: 3000}).start();
      return
    }
    let url = `${appData.urlBase}/messages/sendMessage?token=${appData.urlToken}&address=${address}&targetEmail=${targetEmail}&userEmail=${userEmail}&photoLink=${photoLink}&lat=${lat}&lon=${lon}`;
    let request = new Request(url, {
      method: 'POST',
      headers: new Headers({'Content-Type': 'text/plain'})
    });
    fetch(request)
      .then((response) => {
        return response.json();
      })
      .then((message) => {
        if (message.error) {
          this.setState({notification: 'message error'});
          Animated.timing(this.state.fade, {toValue: 0, duration: 3000}).start();
        }
        else {
          this.setState({notification: 'Message sent'});
          Animated.timing(this.state.fade, {toValue: 0, duration: 3000}).start();
        }
      })
      .catch(() => {
        this.setState({notification: 'Connection error'});
        Animated.timing(this.state.fade, {toValue: 0, duration: 3000}).start();
      })
  }

  resetNotification(){
    this.setState({notification: ''});
    this.state.fade.setValue(1);
  }

  sendBP(){
    this.resetNotification.bind(this)()
    AsyncStorage.getItem('photoLink')
      .then( link => {
          this.setState({photoLink: link});
          this.sendMessage.bind(this)()
      })
  }

  addPictureBP() {
    this.props.navigator.push({name: 'cam'});
  }

  getLocationBP(){
    this.resetNotification.bind(this)()
    this.getLocation.bind(this)()
  }

  addUserBP() {
      this.props.navigator.push({
        name: 'addUser',
        passProps: {isSignUp: false}
      });
  }

  messagesListBP(){
    this.props.navigator.push({name: 'list'})
  }

  onValueChange(value, key) {
    this.setState({
        textEmail : value
    });
  }

  _renderIcon(iconName, size, action){
    return(
      <Button name={iconName}
              size={size}
              backgroundColor="transparent"
              style={{ justifyContent: 'center' }}
              onPress={action}
      />
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  developmentModeText: {
    marginBottom: 20,
    color: 'rgba(0,0,0,0.4)',
    fontSize: 15,
    textAlign: 'center',
  },
  contentContainer: {
    paddingTop: 80,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  welcomeImage: {
    width: 200,
    height: 34.5,
    marginTop: 3,
  },
  getStartedContainer: {
    alignItems: 'center',
    marginHorizontal: 50,
  },
  homeScreenFilename: {
    marginVertical: 7,
  },
  codeHighlightText: {
    color: 'rgba(96,100,109, 0.8)',
  },
  codeHighlightContainer: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 3,
    paddingHorizontal: 4,
  },
  getStartedText: {
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    lineHeight: 23,
    textAlign: 'center',
  },
  tabBarInfoContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    ...Platform.select({
      ios: {
        shadowColor: 'black',
        shadowOffset: {height: -3},
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 20,
      },
    }),
    alignItems: 'center',
    backgroundColor: '#fbfbfb',
    paddingVertical: 20,
  },
  tabBarInfoText: {
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    textAlign: 'center',
  },
  navigationFilename: {
    marginTop: 5,
  },
  helpContainer: {
    marginTop: 15,
    alignItems: 'center',
  },
  helpLink: {
    paddingVertical: 15,
  },
  helpLinkText: {
    fontSize: 14,
    color: '#2e78b7',
  },
});
