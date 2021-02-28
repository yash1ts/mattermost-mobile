// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import ErrorText from '@components/error_text';
import FormattedText from '@components/formatted_text';
import StatusBar from '@components/status_bar';
import {changeOpacity} from '@mm-redux/utils/theme_utils';
import {GlobalStyles} from 'app/styles';
import React, {PureComponent} from 'react';
import {t} from '@utils/i18n';
import {
    ActivityIndicator,
    InteractionManager,
    Keyboard,
    StyleSheet,
    TextInput,
    TouchableWithoutFeedback,
    View,
    Text,
} from 'react-native';
import Button from 'react-native-button';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scrollview';
import {SafeAreaView} from 'react-native-safe-area-context';
import {preventDoubleTap} from '@utils/tap';
import PropTypes from 'prop-types';
import {intlShape} from 'react-intl';
import logo from '@utils/logo';
import InputPassword from '@components/input_password/input_password';
import {goToScreen} from '@actions/navigation';
import CheckBox from '@react-native-community/checkbox';
import EventEmitter from '@mm-redux/utils/event_emitter';
import {NavigationTypes} from '@constants/';

export const mfaExpectedErrors = ['mfa.validate_token.authenticate.app_error', 'ent.mfa.validate_token.authenticate.app_error'];

export default class Signup extends PureComponent {
    static propTypes = {
        actions: PropTypes.shape({
            scheduleExpiredNotification: PropTypes.func.isRequired,
            signup: PropTypes.func.isRequired,
            login: PropTypes.func.isRequired,
        }).isRequired,
        config: PropTypes.object.isRequired,
        license: PropTypes.object.isRequired,
        theme: PropTypes.object,
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
                const msgId = 'login.noEmail';

                // t('login.noEmailLdapUsername');
                // t('login.noEmailUsername');
                // t('login.noEmailUsernameLdapUsername');
                // t('login.noLdapUsername');
                // t('login.noUsername');
                // t('login.noUsernameLdapUsername');

                // // it's slightly weird to be constructing the message ID, but it's a bit nicer than triply nested if statements
                // let msgId = 'login.no';
                // if (this.props.config.EnableSignInWithEmail === 'true') {
                //     msgId += 'Email';
                // }
                // if (this.props.config.EnableSignInWithUsername === 'true') {
                //     msgId += 'Username';
                // }
                // if (this.props.license.IsLicensed === 'true' && this.props.config.EnableLdap === 'true') {
                //     msgId += 'LdapUsername';
                // }

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
            if (!this.username) {
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
            if (!this.state.tosAccept) {
                this.setState({
                    isLoading: false,
                    error: {
                        intl: {
                            id: t('signup.noTos'),
                            defaultMessage: 'Please Read and Accept the Terms of Service',
                        },
                    },
                });
                return;
            }
            this.signIn();
        });
    });

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
            tosAccept: false,
        };
    }

    blur = () => {
        if (this.loginRef.current) {
            this.loginRef.current.blur();
        }

        if (this.passwordRef.current) {
            this.passwordRef.current.blur();
        }

        Keyboard.dismiss();
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
        this.firstName = text;
    };
    handleLastNameChange = (text) => {
        this.lastName = text;
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

    onShowTos = () => {
        EventEmitter.emit(NavigationTypes.NAVIGATION_SHOW_OVERLAY);
        const passProps = {
            type: 'tos',
        };
        goToScreen('Policies', 'Terms of Service', passProps);
    }

    signIn = async () => {
        const {actions} = this.props;
        const {isLoading} = this.state;
        if (isLoading) {
            const result = await actions.signup(this.firstName, this.lastName, this.email.toLowerCase(), this.username, this.password);
            if (result?.error) {
                this.setState({
                    error: result.error,
                    isLoading: false,
                });
                return;
            }
            const data = {
                email: this.email,
            };
            this.setState({
                isLoading: false,
            });

            goToScreen('Verification', 'Email Verification', data);
        }
    };

    render() {
        const {isLoading} = this.state;
        const {formatMessage} = this.context.intl;

        let proceed;
        if (isLoading) {
            proceed = (
                <ActivityIndicator
                    style={{margin: 20}}
                    animating={true}
                    size='large'
                    color='#00f'
                />
            );
        } else {
            const additionalStyle = {};
            if (this.props.config.EmailLoginButtonColor) {
                additionalStyle.backgroundColor = this.props.config.EmailLoginButtonColor;
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
                        <View style={{margin: 20}}>
                            {logo()}
                        </View>
                        <View testID='signup.screen'>
                            <FormattedText
                                style={GlobalStyles.subheader}
                                id='web.root.signup_info'
                                defaultMessage='Join and create communities.'
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
                            placeholderTextColor={changeOpacity('#fff', 0.5)}
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
                            onChangeText={this.handleLastNameChange}
                            onSubmitEditing={this.passwordFocus}
                            placeholder={formatMessage({id: 'signup.last_name', defaultMessage: 'Last Name'})}
                            placeholderTextColor={changeOpacity('#fff', 0.5)}
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
                            placeholderTextColor={changeOpacity('#fff', 0.5)}
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
                            placeholderTextColor={changeOpacity('#fff', 0.5)}
                            ref={this.loginRef}
                            returnKeyType='next'
                            style={GlobalStyles.inputBox}
                            underlineColorAndroid='transparent'
                        />
                        <InputPassword
                            testID='signup.password.input'
                            disableFullscreenUI={true}
                            onChangeText={this.handlePasswordChange}
                            onSubmitEditing={this.preSignIn}
                            placeholder={formatMessage({id: 'signup.password', defaultMessage: 'Password'})}
                            placeholderTextColor={changeOpacity('#fff', 0.5)}
                            reference={this.passwordRef}
                            returnKeyType='go'
                            underlineColorAndroid='transparent'
                        />
                        <View style={{flexDirection: 'row', alignItems: 'center', margin: 10}}>
                            <CheckBox
                                disabled={false}
                                tintColors={{true: '#fff', false: 'white'}}
                                value={this.state.tosAccept}
                                onValueChange={(newValue) => this.setState({tosAccept: newValue})}
                            />
                            <Text
                                style={{color: '#fff'}}
                            >{' I Accept the '}</Text>
                            <Text
                                style={{color: this.props.theme.linkColor}}
                                onPress={this.onShowTos}
                            >{'Terms of Service'}</Text>
                        </View>
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

