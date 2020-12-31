// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import ErrorText from '@components/error_text';
import FormattedText from '@components/formatted_text';
import StatusBar from '@components/status_bar';
import {changeOpacity} from '@mm-redux/utils/theme_utils';
import {GlobalStyles} from 'app/styles';
import React, {PureComponent} from 'react';
import tracker from '@utils/time_tracker';
import telemetry from 'app/telemetry';
import {t} from '@utils/i18n';
import {resetToChannel, goToScreen} from '@actions/navigation';
import {
    ActivityIndicator,
    Dimensions,
    Image,
    InteractionManager,
    Keyboard,
    StyleSheet,
    Text,
    TextInput,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import Button from 'react-native-button';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scrollview';
import {SafeAreaView} from 'react-native-safe-area-context';
import {preventDoubleTap} from '@utils/tap';
import PropTypes from 'prop-types';
import {intlShape} from 'react-intl';

export const mfaExpectedErrors = ['mfa.validate_token.authenticate.app_error', 'ent.mfa.validate_token.authenticate.app_error'];

export default class Signup extends PureComponent {
    static propTypes = {
        actions: PropTypes.shape({
            scheduleExpiredNotification: PropTypes.func.isRequired,
            signup: PropTypes.func.isRequired,
        }).isRequired,
        config: PropTypes.object.isRequired,
        license: PropTypes.object.isRequired,
    };

    static contextTypes = {
        intl: intlShape.isRequired,
    };

    preSignIn = preventDoubleTap(() => {
        this.setState({error: null, isLoading: true});
        Keyboard.dismiss();
        InteractionManager.runAfterInteractions(async () => {
            if (!this.email) {
                t('login.noEmail');
                t('login.noEmailLdapUsername');
                t('login.noEmailUsername');
                t('login.noEmailUsernameLdapUsername');
                t('login.noLdapUsername');
                t('login.noUsername');
                t('login.noUsernameLdapUsername');

                // it's slightly weird to be constructing the message ID, but it's a bit nicer than triply nested if statements
                let msgId = 'login.no';
                if (this.props.config.EnableSignInWithEmail === 'true') {
                    msgId += 'Email';
                }
                if (this.props.config.EnableSignInWithUsername === 'true') {
                    msgId += 'Username';
                }
                if (this.props.license.IsLicensed === 'true' && this.props.config.EnableLdap === 'true') {
                    msgId += 'LdapUsername';
                }

                this.setState({
                    isLoading: false,
                    error: {
                        intl: {
                            id: msgId,
                            defaultMessage: '',
                            values: {
                                ldapUsername: this.props.config.LdapLoginFieldName ||
                                this.context.intl.formatMessage({
                                    id: 'login.ldapUsernameLower',
                                    defaultMessage: 'AD/LDAP username',
                                }),
                            },
                        },
                    },
                });
                return;
            }
            if(!this.username) {
                this.setState({
                    isLoading: false,
                    error: {
                        intl: {
                            id: t('signup.noUserName'),
                            defaultMessage: 'Please enter your User Name',
                        },
                    },
                });
                return;
            }

            if (!this.password) {
                this.setState({
                    isLoading: false,
                    error: {
                        intl: {
                            id: t('login.noPassword'),
                            defaultMessage: 'Please enter your password',
                        },
                    },
                });
                return;
            }

            this.signIn();
        });
    });

    getLoginErrorMessage = (error) => {
        return (
            this.getServerErrorForLogin(error) ||
            this.state.error
        );
    };

    getServerErrorForLogin = (error) => {
        if (!error) {
            return null;
        }
        const errorId = error.server_error_id;
        if (!errorId) {
            return error.message;
        }
        if (
            errorId === 'store.sql_user.get_for_login.app_error' ||
            errorId === 'ent.ldap.do_login.user_not_registered.app_error'
        ) {
            return {
                intl: {
                    id: t('login.userNotFound'),
                    defaultMessage: "We couldn't find an account matching your login credentials.",
                },
            };
        } else if (
            errorId === 'api.user.check_user_password.invalid.app_error' ||
            errorId === 'ent.ldap.do_login.invalid_password.app_error'
        ) {
            return {
                intl: {
                    id: t('login.invalidPassword'),
                    defaultMessage: 'Your password is incorrect.',
                },
            };
        }
        return error.message;
    };

    constructor(props) {
        super(props);

        this.loginRef = React.createRef();
        this.passwordRef = React.createRef();
        this.scroll = React.createRef();
        this.email = '';
        this.password = '';
        this.username = '';
        this.firstName = '';
        this.lastName = '';

        this.state = {
            error: null,
            isLoading: false,
        };
    }

    goToMfa = () => {
        const {intl} = this.context;
        const screen = 'MFA';
        const title = intl.formatMessage({id: 'mobile.routes.mfa', defaultMessage: 'Multi-factor Authentication'});
        const loginId = this.email;
        const password = this.password;

        goToScreen(screen, title, {goToChannel: this.goToChannel, loginId, password});
    };

    blur = () => {
        if (this.loginRef.current) {
            this.loginRef.current.blur();
        }

        if (this.passwordRef.current) {
            this.passwordRef.current.blur();
        }

        Keyboard.dismiss();
    };

    checkLoginResponse = (data) => {
        if (mfaExpectedErrors.includes(data?.error?.server_error_id)) { // eslint-disable-line camelcase
            this.goToMfa();
            this.setState({isLoading: false});
            return false;
        }

        if (data?.error) {
            this.setState({
                error: this.getLoginErrorMessage(data.error),
                isLoading: false,
            });
            return false;
        }

        this.setState({isLoading: false});
        return true;
    };

    handleEmailChange = (text) => {
        this.email = text;
    };
    handleUserNameChange = (text) => {
        this.username = text;
    };

    handlePasswordChange = (text) => {
        this.password = text;
    };
    handleFirstNameChange = (text) => {
        this.password = text;
    };
    handleLastNameChange = (text) => {
        this.password = text;
    };

    orientationDidChange = () => {
        if (this.scroll.current) {
            this.scroll.current.scrollTo({x: 0, y: 0, animated: true});
        }
    };

    passwordFocus = () => {
        if (this.passwordRef.current) {
            this.passwordRef.current.focus();
        }
    };

    goToChannel = () => {
        telemetry.remove(['start:overall']);

        tracker.initialLoad = Date.now();
        this.scheduleSessionExpiredNotification();
        resetToChannel();
    };

    signIn = async () => {
        const {actions} = this.props;
        const {isLoading} = this.state;
        if (isLoading) {
            const result = await actions.signup(this.firstName, this.lastName, this.email.toLowerCase(), this.username, this.password);
            if (this.checkLoginResponse(result)) {
                this.goToChannel();
            }
        }
    };
    scheduleSessionExpiredNotification = () => {
        const {intl} = this.context;
        const {actions} = this.props;

        actions.scheduleExpiredNotification(intl);
    };

    render() {
        const {isLoading} = this.state;
        const {formatMessage} = this.context.intl;

        let proceed;
        if (isLoading) {
            proceed = (
                <ActivityIndicator
                    animating={true}
                    size='small'
                />
            );
        } else {
            const additionalStyle = {};
            if (this.props.config.EmailLoginButtonColor) {
                additionalStyle.backgroundColor = this.props.config.EmailLoginButtonColor;
            }
            if (this.props.config.EmailLoginButtonBorderColor) {
                additionalStyle.borderColor = this.props.config.EmailLoginButtonBorderColor;
            }

            const additionalTextStyle = {};
            if (this.props.config.EmailLoginButtonTextColor) {
                additionalTextStyle.color = this.props.config.EmailLoginButtonTextColor;
            }

            proceed = (
                <Button
                    testID='login.signin.button'
                    onPress={this.preSignIn}
                    containerStyle={[GlobalStyles.signupButton, additionalStyle]}
                >
                    <FormattedText
                        id='signup.button'
                        defaultMessage='Sign Up'
                        style={[GlobalStyles.signupButtonText, additionalTextStyle]}
                    />
                </Button>
            );
        }

        return (
            <SafeAreaView style={style.container}>
                <StatusBar/>
                <TouchableWithoutFeedback
                    onPress={this.blur}
                    accessible={false}
                >
                    <KeyboardAwareScrollView
                        ref={this.scrollRef}
                        style={style.container}
                        contentContainerStyle={style.innerContainer}
                        keyboardShouldPersistTaps='handled'
                        enableOnAndroid={true}
                    >
                        <Image
                            source={require('@assets/images/logo.png')}
                            style={{height: 72, resizeMode: 'contain'}}
                        />
                        <View testID='signup.screen'>
                            <Text style={GlobalStyles.header}>
                                {this.props.config.SiteName}
                            </Text>
                            <FormattedText
                                style={GlobalStyles.subheader}
                                id='web.root.signup_info'
                                defaultMessage='All team communication in one place, searchable and accessible anywhere'
                            />
                        </View>
                        <ErrorText
                            testID='signup.error.text'
                            error={this.state.error}
                        />
                        <TextInput
                            testID='signup.username.input'
                            autoCapitalize='none'
                            autoCorrect={false}
                            blurOnSubmit={false}
                            disableFullscreenUI={true}
                            keyboardType='name-phone-pad'
                            onChangeText={this.handleFirstNameChange}
                            onSubmitEditing={this.passwordFocus}
                            placeholder={formatMessage({id: 'signup.first_name', defaultMessage: 'First Name'})}
                            placeholderTextColor={changeOpacity('#000', 0.5)}
                            ref={this.loginRef}
                            returnKeyType='next'
                            style={GlobalStyles.inputBox}
                            underlineColorAndroid='transparent'
                        />
                        <TextInput
                            testID='signup.username.input'
                            autoCapitalize='none'Register
                            autoCorrect={false}
                            blurOnSubmit={false}
                            disableFullscreenUI={true}
                            keyboardType='name-phone-pad'
                            onChangeText={this.handleLastNameChange}
                            onSubmitEditing={this.passwordFocus}
                            placeholder={formatMessage({id: 'signup.last_name', defaultMessage: 'Last Name'})}
                            placeholderTextColor={changeOpacity('#000', 0.5)}
                            ref={this.loginRef}
                            returnKeyType='next'
                            style={GlobalStyles.inputBox}
                            underlineColorAndroid='transparent'
                        />
                        <TextInput
                            testID='signup.username.input'
                            autoCapitalize='none'
                            autoCorrect={false}
                            blurOnSubmit={false}
                            disableFullscreenUI={true}
                            keyboardType='email-address'
                            onChangeText={this.handleEmailChange}
                            onSubmitEditing={this.passwordFocus}
                            placeholder={formatMessage({id: 'signup.email.register', defaultMessage: 'Email'})}
                            placeholderTextColor={changeOpacity('#000', 0.5)}
                            ref={this.loginRef}
                            returnKeyType='next'
                            style={GlobalStyles.inputBox}
                            underlineColorAndroid='transparent'
                        />
                        <TextInput
                            testID='signup.username.input'
                            autoCapitalize='none'
                            autoCorrect={false}
                            blurOnSubmit={false}
                            disableFullscreenUI={true}
                            keyboardType='name-phone-pad'
                            onChangeText={this.handleUserNameChange}
                            onSubmitEditing={this.passwordFocus}
                            placeholder={formatMessage({id: 'signup.username', defaultMessage: 'User Name'})}
                            placeholderTextColor={changeOpacity('#000', 0.5)}
                            ref={this.loginRef}
                            returnKeyType='next'
                            style={GlobalStyles.inputBox}
                            underlineColorAndroid='transparent'
                        />
                        <TextInput
                            testID='signup.password.input'
                            autoCapitalize='none'
                            autoCorrect={false}
                            disableFullscreenUI={true}
                            onChangeText={this.handlePasswordChange}
                            onSubmitEditing={this.preSignIn}
                            style={GlobalStyles.inputBox}
                            placeholder={formatMessage({id: 'signup.password', defaultMessage: 'Password'})}
                            placeholderTextColor={changeOpacity('#000', 0.5)}
                            ref={this.passwordRef}
                            returnKeyType='go'
                            secureTextEntry={true}
                            underlineColorAndroid='transparent'
                        />
                        {proceed}
                    </KeyboardAwareScrollView>
                </TouchableWithoutFeedback>
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
        flexDirection: 'column',
        justifyContent: 'center',
        paddingHorizontal: 15,
        paddingVertical: 50,
    },
});

