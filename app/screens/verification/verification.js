// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {PureComponent} from 'react';
import {
    Text,
    View,
    StyleSheet,
    BackHandler,
} from 'react-native';
import Button from 'react-native-button';
import StatusBar from '@components/status_bar';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scrollview';
import {SafeAreaView} from 'react-native-safe-area-context';
import {GlobalStyles} from 'app/styles';
import {resetToLogin, setButtons} from '@actions/navigation';
import {Client4} from '@mm-redux/client';
import {TextInput} from 'react-native-gesture-handler';
import {isEmail} from '@mm-redux/utils/helpers';
import {changeOpacity} from '@mm-redux/utils/theme_utils';
import {Navigation} from 'react-native-navigation';
import CompassIcon from '@components/compass_icon';
import PropTypes from 'prop-types';
import Constants from '@constants/view';
import {preventDoubleTap} from '@utils/tap';
import logo from '@utils/logo';

const EMAIL_MSG = 'Please check your email, we have sent you a verification link.';

export default class Verification extends PureComponent {
    static propTypes = {
        actions: PropTypes.shape({
        }).isRequired,
        theme: PropTypes.object,
        email: PropTypes.string,
        componentId: PropTypes.string,
    };

    constructor(props) {
        super(props);
        this.intervalId = null;
        this.email = props.email;
        this.navigation = null;

        this.state = {
            timer: props.email ? Constants.RESEND_EMAIL_WAIT : 0,
            msg: props.email ? EMAIL_MSG : 'Please enter your email.',
        };
    }

    onContinue = () => {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
        if (this.navigation) {
            this.navigation.remove();
        }
        BackHandler.removeEventListener('hardwareBackPress', this.onBackPress);
        resetToLogin();
    };

    onBackPress = () => {
        if (this.props.componentId === 'Verification') {
            resetToLogin();
            return true;
        }
        return false;
    }

    setTimerCallback = () => (() => {
        this.setState((state) => ({
            timer: state.timer - 1,
        }));
    });

    componentDidMount() {
        if (this.props.email) {
            this.intervalId = setInterval(this.setTimerCallback(), 1000);
        }
        BackHandler.addEventListener('hardwareBackPress', this.onBackPress);
        CompassIcon.getImageSource('arrow-left', 24, this.props.theme.sidebarHeaderTextColor).then((source) => {
            this.closeButton = source;

            this.close = {
                enabled: true,
                id: 'close',
                icon: this.closeButton,
            };

            setButtons(this.props.componentId, {
                leftButtons: [this.close],
            });
        });
        this.navigation = Navigation.events().registerNavigationButtonPressedListener(({buttonId}) => {
            if (buttonId === this.close.id) {
                this.onContinue();
            }
        });
    }

    componentWillUnmount() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
        if (this.navigation) {
            this.navigation.remove();
        }
        BackHandler.removeEventListener('hardwareBackPress', this.onBackPress);
    }

    componentDidUpdate() {
        if (this.state.timer === 0) {
            clearInterval(this.intervalId);
        }
    }

    onResend = preventDoubleTap(() => {
        if (!isEmail(this.email)) {
            this.setState({
                msg: 'Please enter a valid email',
            });
            return;
        }
        this.setState({
            msg: EMAIL_MSG,
            timer: Constants.RESEND_EMAIL_WAIT,
        });
        this.intervalId = setInterval(this.setTimerCallback(), 1000);
        Client4.sendVerificationEmail(this.email).then((result) => {
            if (result.error) {
                this.setState({
                    msg: result.error,
                });
            } else {
                this.setState({
                    msg: EMAIL_MSG,
                });
            }
        }).catch((error) => {
            this.setState({
                msg: error.message,
            });
        });
    })

    render() {
        const {email} = this.props;
        const {timer, msg} = this.state;
        return (
            <SafeAreaView style={style.container}>
                <StatusBar/>
                <KeyboardAwareScrollView
                    style={style.container}
                    contentContainerStyle={style.innerContainer}
                    keyboardShouldPersistTaps='handled'
                    enableOnAndroid={true}
                >
                    <View style={style.innerContainer}>
                        <View style={{margin: 20}}>
                            {logo()}
                        </View>
                        {msg && <Text style={{...style.text, marginBottom: 30}} > {msg}</Text>}
                        <TextInput
                            placeholder={'Email'}
                            onChangeText={(text) => {
                                this.email = text;
                            }}
                            defaultValue={email}
                            editable={!email}
                            autoCapitalize='none'
                            autoCorrect={false}
                            blurOnSubmit={false}
                            disableFullscreenUI={true}
                            keyboardType='name-phone-pad'
                            placeholderTextColor={changeOpacity('#fff', 0.5)}
                            returnKeyType='next'
                            style={GlobalStyles.inputBox}
                            underlineColorAndroid='transparent'
                        />
                        {timer === 0 &&
                        <Button
                            containerStyle={GlobalStyles.signupButton}
                        >
                            <Text
                                style={[GlobalStyles.signupButtonText, style.text]}
                                onPress={this.onResend}
                            >{email ? 'Resend Email' : 'Send Email'}</Text>
                        </Button>}
                        {timer !== 0 && <Text style={{color: '#fff', margin: 10}}>{`00:${timer} to Resend Email`}</Text>}
                        {email &&
                        <Button
                            containerStyle={GlobalStyles.signupButton}
                            onPress={this.onContinue}
                        >
                            <Text
                                style={[GlobalStyles.signupButtonText, style.text]}
                            >{'Continue'}</Text>
                        </Button>}
                    </View>

                </KeyboardAwareScrollView>
            </SafeAreaView>);
    }
}

const style = StyleSheet.create({
    container: {
        flex: 1,
    },
    innerContainer: {
        flex: 1,
        alignSelf: 'stretch',
        alignItems: 'center',
        flexDirection: 'column',
        paddingHorizontal: 15,
        paddingVertical: 50,
    },
    text: {
        color: '#fff',
        fontSize: 16,
    },
    buttons: {
        borderRadius: 5,
        margin: 20,
    },
});
