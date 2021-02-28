// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {intlShape} from 'react-intl';
import {
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
} from 'react-native';
import Button from 'react-native-button';
import {SafeAreaView} from 'react-native-safe-area-context';

import {goToScreen} from '@actions/navigation';
import LocalConfig from '@assets/config';
import gitlab from '@assets/images/gitlab.png';
import FormattedText from '@components/formatted_text';
import StatusBar from '@components/status_bar';
import {ViewTypes} from '@constants';
import globalEventHandler from '@init/global_event_handler';
import {preventDoubleTap} from '@utils/tap';

import {GlobalStyles} from 'app/styles';

export default class LoginOptions extends PureComponent {
    static propTypes = {
        config: PropTypes.object.isRequired,
        license: PropTypes.object.isRequired,
    };

    static contextTypes = {
        intl: intlShape.isRequired,
    };

    componentDidMount() {
        Dimensions.addEventListener('change', this.orientationDidChange);
    }

    componentWillUnmount() {
        Dimensions.removeEventListener('change', this.orientationDidChange);
    }

    goToLogin = preventDoubleTap(async () => {
        const {intl} = this.context;
        const screen = 'Login';
        const title = intl.formatMessage({id: 'mobile.routes.login', defaultMessage: 'Login'});

        globalEventHandler.clearCookiesAndWebData();
        goToScreen(screen, title);
    });

    goToSSO = async (ssoType) => {
        const {intl} = this.context;
        const screen = 'SSO';
        const title = intl.formatMessage({id: 'mobile.routes.sso', defaultMessage: 'Single Sign-On'});

        globalEventHandler.clearCookiesAndWebData();
        goToScreen(screen, title, {ssoType});
    };

    orientationDidChange = () => {
        this.scroll.scrollTo({x: 0, y: 0, animated: true});
    };

    renderEmailOption = () => {
        const {config} = this.props;
        const forceHideFromLocal = LocalConfig.HideEmailLoginExperimental;

        if (!forceHideFromLocal && (config.EnableSignInWithEmail === 'true' || config.EnableSignInWithUsername === 'true')) {
            const backgroundColor = config.EmailLoginButtonColor || '#2389d7';
            const additionalStyle = {
                backgroundColor,
            };

            if (config.EmailLoginButtonBorderColor) {
                additionalStyle.borderColor = config.EmailLoginButtonBorderColor;
            }

            const textColor = config.EmailLoginButtonTextColor || 'white';

            return (
                <Button
                    key='email'
                    onPress={this.goToLogin}
                    containerStyle={[GlobalStyles.signupButton, additionalStyle]}
                >
                    <FormattedText
                        id='signup.email'
                        defaultMessage='Email and Password'
                        style={[GlobalStyles.signupButtonText, {color: textColor}]}
                    />
                </Button>
            );
        }

        return null;
    };

    renderLdapOption = () => {
        const {config, license} = this.props;
        const forceHideFromLocal = LocalConfig.HideLDAPLoginExperimental;

        if (!forceHideFromLocal && license.IsLicensed === 'true' && config.EnableLdap === 'true') {
            const backgroundColor = config.LDAPLoginButtonColor || '#2389d7';
            const additionalStyle = {
                backgroundColor,
                borderColor: 'transparent',
                borderWidth: 0,
            };

            if (config.LDAPLoginButtonBorderColor) {
                additionalStyle.borderColor = config.LDAPLoginButtonBorderColor;
            }

            const textColor = config.LDAPLoginButtonTextColor || 'white';

            let buttonText;
            if (config.LdapLoginFieldName) {
                buttonText = (
                    <Text style={[GlobalStyles.signupButtonText, {color: textColor}]}>
                        {config.LdapLoginFieldName}
                    </Text>
                );
            } else {
                buttonText = (
                    <FormattedText
                        id='login.ldapUsernameLower'
                        defaultMessage='AD/LDAP username'
                        style={[GlobalStyles.signupButtonText, {color: textColor}]}
                    />
                );
            }

            return (
                <Button
                    key='ldap'
                    onPress={this.goToLogin}
                    containerStyle={[GlobalStyles.signupButton, additionalStyle]}
                >
                    {buttonText}
                </Button>
            );
        }

        return null;
    };

    renderGitlabOption = () => {
        const {config} = this.props;

        const forceHideFromLocal = LocalConfig.HideGitLabLoginExperimental;

        if (!forceHideFromLocal && config.EnableSignUpWithGitLab === 'true') {
            return (
                <Button
                    key='gitlab'
                    onPress={preventDoubleTap(() => this.goToSSO(ViewTypes.GITLAB))}
                    containerStyle={[GlobalStyles.signupButton, {backgroundColor: '#548', borderColor: 'transparent', borderWidth: 0}]}
                >
                    <Image
                        source={gitlab}
                        style={{height: 18, marginRight: 5, width: 18}}
                    />
                    <Text
                        style={[GlobalStyles.signupButtonText, {color: 'white'}]}
                    >
                        {'GitLab'}
                    </Text>
                </Button>
            );
        }

        return null;
    };

    renderO365Option = () => {
        const {config, license} = this.props;
        const forceHideFromLocal = LocalConfig.HideO365LoginExperimental;
        const o365Enabled = config.EnableSignUpWithOffice365 === 'true' && license.IsLicensed === 'true' && license.Office365OAuth === 'true';

        if (!forceHideFromLocal && o365Enabled) {
            const backgroundColor = '#2389d7';
            const additionalStyle = {
                backgroundColor,
                borderColor: 'transparent',
                borderWidth: 0,
            };

            const textColor = 'white';

            return (
                <Button
                    key='o365'
                    onPress={preventDoubleTap(() => this.goToSSO(ViewTypes.OFFICE365))}
                    containerStyle={[GlobalStyles.signupButton, additionalStyle]}
                >
                    <FormattedText
                        id='signup.office365'
                        defaultMessage='Office 365'
                        style={[GlobalStyles.signupButtonText, {color: textColor}]}
                    />
                </Button>
            );
        }

        return null;
    };

    renderSamlOption = () => {
        const {config, license} = this.props;
        const forceHideFromLocal = LocalConfig.HideSAMLLoginExperimental;

        if (!forceHideFromLocal && config.EnableSaml === 'true' && license.IsLicensed === 'true' && license.SAML === 'true') {
            const backgroundColor = config.SamlLoginButtonColor || '#34a28b';

            const additionalStyle = {
                backgroundColor,
                borderColor: 'transparent',
                borderWidth: 0,
            };

            if (config.SamlLoginButtonBorderColor) {
                additionalStyle.borderColor = config.SamlLoginButtonBorderColor;
            }

            const textColor = config.SamlLoginButtonTextColor || 'white';

            return (
                <Button
                    key='saml'
                    onPress={preventDoubleTap(() => this.goToSSO(ViewTypes.SAML))}
                    containerStyle={[GlobalStyles.signupButton, additionalStyle]}
                >
                    <Text
                        style={[GlobalStyles.signupButtonText, {color: textColor}]}
                    >
                        {config.SamlLoginButtonText}
                    </Text>
                </Button>
            );
        }

        return null;
    };

    scrollRef = (ref) => {
        this.scroll = ref;
    };

    render() {
        return (
            <SafeAreaView style={style.container}>
                <ScrollView
                    style={style.container}
                    contentContainerStyle={style.innerContainer}
                    ref={this.scrollRef}
                >
                    <StatusBar/>
                    <Image
                        source={require('@assets/images/logo.png')}
                        style={{height: 72, resizeMode: 'contain'}}
                    />
                    <Text style={GlobalStyles.header}>
                        {this.props.config.SiteName}
                    </Text>
                    <FormattedText
                        style={GlobalStyles.subheader}
                        id='web.root.signup_info'
                        defaultMessage='Join and create communities'
                    />
                    <FormattedText
                        style={[GlobalStyles.subheader, {fontWeight: 'bold', marginTop: 10}]}
                        id='mobile.login_options.choose_title'
                        defaultMessage='Choose your login method'
                    />
                    {this.renderEmailOption()}
                    {this.renderLdapOption()}
                    {this.renderGitlabOption()}
                    {this.renderSamlOption()}
                    {this.renderO365Option()}
                </ScrollView>
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
        flex: 1,
    },
});
