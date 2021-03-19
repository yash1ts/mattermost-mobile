// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import Button from 'react-native-button';
import {intlShape} from 'react-intl';

import {
    StyleSheet,
    View,
    Text,
    ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scrollview';

import ErrorText from '@components/error_text';
import FormattedText from '@components/formatted_text';
import StatusBar from '@components/status_bar';
import {changeOpacity} from '@utils/theme';

import {GlobalStyles} from 'app/styles';
import logo from '@utils/logo';
import InputPassword from '@components/input_password/input_password';
import {matchDeepLink} from '@utils/url';
import {Client4} from '@mm-redux/client';
import {dismissModal, setButtons} from '@actions/navigation';
import CompassIcon from '@components/compass_icon';
import {Navigation} from 'react-native-navigation';
import {isPassword} from '@mm-redux/utils/helpers';

export default class ChangePassword extends PureComponent {
    static propTypes = {
        actions: PropTypes.shape({
            resetUserPassword: PropTypes.func.isRequired,
            setDeepLinkURL: PropTypes.func.isRequired,
        }),
        deepLinkURL: PropTypes.string.isRequired,
        serverUrl: PropTypes.string,
        siteUrl: PropTypes.string,
        theme: PropTypes.object,
        componentId: PropTypes.string,
    }

    static contextTypes = {
        intl: intlShape.isRequired,
    };

    getToken = (url) => {
        const match = matchDeepLink(url, this.props.serverUrl, this.props.siteUrl);
        return match?.token || '';
    }

    constructor(props) {
        super(props);
        this.password = '';
        this.token = this.getToken(props.deepLinkURL);
        this.state = {
            error: '',
            isLoading: false,
        };

        CompassIcon.getImageSource('close', 24, props.theme.sidebarHeaderTextColor).then((source) => {
            this.closeButton = source;

            this.close = {
                enabled: true,
                id: 'close-dialog',
                icon: this.closeButton,
            };

            setButtons(props.componentId, {
                leftButtons: [this.close],
            });
        });
    }

    onSumbitPass = () => {
        this.setState({
            error: '',
            isLoading: true,
        });
        if (!this.password || !isPassword(this.password)) {
            this.setState({
                error: 'Enter a password with minimum eight characters, at least one uppercase letter, one lowercase letter, one number and one special character',
                isLoading: false,
            });
            return;
        }
        Client4.resetUserPassword(this.token, this.password).then(() => {
            this.setState({
                isLoading: false,
                msg: 'Password Changed',
                error: '',
            });
        }).catch((result) => {
            this.setState({
                error: result.message,
                isLoading: false,
                msg: '',
            });
        });
    }

    componentDidMount() {
        this.props.actions.setDeepLinkURL('');
        this.navigationEventListener = Navigation.events().registerNavigationButtonPressedListener(
            ({buttonId}) => {
                if (buttonId === this.close.id) {
                    dismissModal();
                }
            },
        );
    }

    componentWillUnmount() {
        this.navigationEventListener.remove();
    }

    render() {
        let displayStatus;
        if (this.state.error) {
            displayStatus = (
                <ErrorText
                    testID='forgot_password.error.text'
                    error={this.state.error}
                    textStyle={style.errorText}
                />
            );
        }
        if (this.state.msg) {
            displayStatus = (
                <Text style={style.successText}>{this.state.msg}</Text>
            );
        }

        return (
            <SafeAreaView
                testID='forgot_password.screen'
                style={style.container}
            >
                <StatusBar/>
                <KeyboardAwareScrollView
                    style={style.container}
                    contentContainerStyle={style.innerContainer}
                    keyboardShouldPersistTaps='handled'
                    enableOnAndroid={true}
                >
                    <View style={style.innerContainer}>
                        <View style={{margin: 30}}>
                            {logo()}
                        </View>
                        {displayStatus}
                        {!this.state.msg &&
                        <>
                            <FormattedText
                                style={[GlobalStyles.subheader]}
                                id='password_change.description'
                                defaultMessage='Please enter the new password'
                            />
                            <InputPassword
                                testID='login.password.input'
                                disableFullscreenUI={true}
                                onChangeText={(newPassword) => {
                                    this.password = newPassword;
                                }}
                                placeholder={this.context.intl.formatMessage({id: 'password_change.password', defaultMessage: ' New Password'})}
                                placeholderTextColor={changeOpacity('#fff', 0.5)}
                                returnKeyType='go'
                                underlineColorAndroid='transparent'
                            />
                            { !this.state.isLoading &&
                            <Button
                                containerStyle={GlobalStyles.signupButton}
                                onPress={this.onSumbitPass}
                            >
                                <FormattedText
                                    id='password_send.change'
                                    defaultMessage='Submit'
                                    style={[GlobalStyles.signupButtonText]}
                                />
                            </Button>}
                            {this.state.isLoading &&
                            <ActivityIndicator
                                size='large'
                                color='#00f'
                                style={{margin: 10}}
                            />
                            }
                        </>}
                    </View>
                </KeyboardAwareScrollView>
            </SafeAreaView>
        );
    }
}

const style = StyleSheet.create({
    container: {
        flex: 1,
    },
    innerContainer: {
        alignItems: 'center',
        alignSelf: 'stretch',
        flexDirection: 'column',
        justifyContent: 'center',
        paddingHorizontal: 15,
        paddingVertical: 50,
    },
    forgotPasswordBtn: {
        borderColor: 'transparent',
    },
    successText: {
        color: '#3c763d',
        margin: 10,
    },
    emailId: {
        fontWeight: 'bold',
    },
    successTxtColor: {
        color: '#3c763d',
    },
    defaultTopPadding: {
    },
});
