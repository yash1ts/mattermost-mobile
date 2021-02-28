// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {intlShape, injectIntl} from 'react-intl';
import {
    Linking,
    Platform,
    ScrollView,
    View,
} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import {Navigation} from 'react-native-navigation';
import {SafeAreaView} from 'react-native-safe-area-context';

import {goToScreen, dismissModal} from '@actions/navigation';
import LocalConfig from '@assets/config';
import StatusBar from '@components/status_bar';
import SettingsItem from '@screens/settings/settings_item';
import {t} from '@utils/i18n';
import {preventDoubleTap} from '@utils/tap';
import {changeOpacity, makeStyleSheetFromTheme} from '@utils/theme';
import {NavigationTypes} from '@constants/';
import EventEmitter from '@mm-redux/utils/event_emitter';

class Settings extends PureComponent {
    static propTypes = {
        actions: PropTypes.shape({
            clearErrors: PropTypes.func.isRequired,
            purgeOfflineStore: PropTypes.func.isRequired,
        }).isRequired,
        config: PropTypes.object.isRequired,
        currentTeamId: PropTypes.string.isRequired,
        currentUserId: PropTypes.string.isRequired,
        currentUrl: PropTypes.string.isRequired,
        errors: PropTypes.array.isRequired,
        intl: intlShape.isRequired,
        joinableTeams: PropTypes.array.isRequired,
        theme: PropTypes.object,
    };

    static defaultProps = {
        errors: [],
        joinableTeams: [],
    };

    componentDidMount() {
        this.navigationEventListener = Navigation.events().bindComponent(this);
    }

    navigationButtonPressed({buttonId}) {
        if (buttonId === 'close-settings') {
            dismissModal();
        }
    }

    errorEmailBody = () => {
        const {config, currentUserId, currentTeamId, errors} = this.props;
        let contents = [
            'Please share a description of the problem:\n\n',
            `Current User Id: ${currentUserId}`,
            `Current Team Id: ${currentTeamId}`,
            `Server Version: ${config.Version} (Build ${config.BuildNumber})`,
            `App Version: ${DeviceInfo.getVersion()} (Build ${DeviceInfo.getBuildNumber()})`,
            `App Platform: ${Platform.OS}`,
        ];
        if (errors.length) {
            const errorArray = errors.map((e) => {
                const {error} = e;
                const stack = error.stack || '';
                return `Date: ${e.date}\nMessage: ${error.message}\nStack trace:\n${stack}\n\n`;
            }).join('');

            contents = contents.concat([
                '',
                'Errors:',
                errorArray,
            ]);
        }
        return contents.join('\n');
    };

    goToAbout = preventDoubleTap(() => {
        EventEmitter.emit(NavigationTypes.NAVIGATION_SHOW_OVERLAY);
        const passProps = {
            type: 'privacy',
        };
        goToScreen('Policies', 'Privacy Policy', passProps);
    });

    goToNotifications = preventDoubleTap(() => {
        const {intl} = this.props;
        const screen = 'NotificationSettings';
        const title = intl.formatMessage({id: 'user.settings.modal.notifications', defaultMessage: 'Notifications'});

        goToScreen(screen, title);
    });

    goToDisplaySettings = preventDoubleTap(() => {
        const {intl} = this.props;
        const screen = 'DisplaySettings';
        const title = intl.formatMessage({id: 'user.settings.modal.display', defaultMessage: 'Display'});

        goToScreen(screen, title);
    });

    goToAdvancedSettings = preventDoubleTap(() => {
        const {intl} = this.props;
        const screen = 'AdvancedSettings';
        const title = intl.formatMessage({id: 'mobile.advanced_settings.title', defaultMessage: 'Advanced Settings'});

        goToScreen(screen, title);
    });

    goToSelectTeam = preventDoubleTap(() => {
        const {currentUrl, intl} = this.props;
        const screen = 'SelectTeam';
        const title = intl.formatMessage({id: 'mobile.routes.selectTeam', defaultMessage: 'Select Team'});
        const passProps = {
            currentUrl,
        };

        goToScreen(screen, title, passProps);
    });

    goToClientUpgrade = preventDoubleTap(() => {
        const {intl} = this.props;
        const screen = 'ClientUpgrade';
        const title = intl.formatMessage({id: 'mobile.client_upgrade', defaultMessage: 'Upgrade App'});
        const passProps = {
            userCheckedForUpgrade: true,
        };

        goToScreen(screen, title, passProps);
    });

    openErrorEmail = preventDoubleTap(() => {
        const {config} = this.props;
        const recipient = config.SupportEmail;
        const subject = `Problem with ${config.SiteName} React Native app`;
        const mailTo = `mailto:${recipient}?subject=${subject}&body=${this.errorEmailBody()}`;

        Linking.canOpenURL(mailTo).then((supported) => {
            if (supported) {
                Linking.openURL(mailTo);
                this.props.actions.clearErrors();
            }
        });
    });

    openHelp = preventDoubleTap(() => {
        const {config} = this.props;
        const link = config.HelpLink ? config.HelpLink.toLowerCase() : '';

        Linking.canOpenURL(link).then((supported) => {
            if (supported) {
                Linking.openURL(link);
            }
        });
    });

    render() {
        const {theme} = this.props;
        const style = getStyleSheet(theme);
        const showTeams = false;

        // const showHelp = isValidUrl(config.HelpLink);

        let showArrow = false;
        let middleDividerStyle = style.divider;
        if (Platform.OS === 'ios') {
            showArrow = true;
            middleDividerStyle = style.middleDivider;
        }

        return (
            <SafeAreaView
                edges={['left', 'right']}
                testID='general_settings.screen'
                style={style.container}
            >
                <StatusBar/>
                <ScrollView
                    alwaysBounceVertical={false}
                    contentContainerStyle={style.wrapper}
                >
                    <View style={style.divider}/>
                    <SettingsItem
                        testID='general_settings.notifications.action'
                        defaultMessage='Notifications'
                        i18nId={t('user.settings.modal.notifications')}
                        iconName='bell-outline'
                        onPress={this.goToNotifications}
                        showArrow={showArrow}
                        theme={theme}
                        separator={true}
                    />
                    <SettingsItem
                        testID='general_settings.display.action'
                        defaultMessage='Display'
                        i18nId={t('user.settings.modal.display')}
                        iconName='layers-outline'
                        onPress={this.goToDisplaySettings}
                        showArrow={showArrow}
                        theme={theme}
                        separator={true}
                    />
                    {showTeams &&
                        <SettingsItem
                            testID='general_settings.select_team.action'
                            defaultMessage='Open teams you can join'
                            i18nId={t('mobile.select_team.join_open')}
                            iconName='menu'
                            onPress={this.goToSelectTeam}
                            showArrow={showArrow}
                            theme={theme}
                            separator={true}
                        />
                    }
                    <SettingsItem
                        testID='general_settings.advanced.action'
                        defaultMessage='Advanced Settings'
                        i18nId={t('mobile.advanced_settings.title')}
                        iconName='tune'
                        onPress={this.goToAdvancedSettings}
                        showArrow={showArrow}
                        theme={theme}
                        separator={true}
                    />
                    {LocalConfig.EnableMobileClientUpgrade && LocalConfig.EnableMobileClientUpgradeUserSetting &&
                        <SettingsItem
                            testID='general_settings.check_for_upgrade.action'
                            defaultMessage='Check for Upgrade'
                            i18nId={t('mobile.settings.modal.check_for_upgrade')}
                            iconName='update'
                            onPress={this.goToClientUpgrade}
                            showArrow={showArrow}
                            theme={theme}
                            separator={true}
                        />
                    }
                    <SettingsItem
                        testID='general_settings.about.action'
                        defaultMessage='{appTitle} Privacy Policy'
                        messageValues={{appTitle: 'Tupp'}}
                        i18nId={t('privacy_policy.title')}
                        iconName='information-outline'
                        onPress={this.goToAbout}
                        separator={false}
                        showArrow={showArrow}
                        theme={theme}
                    />
                    <View style={middleDividerStyle}/>
                    {/* {showHelp &&
                        <SettingsItem
                            testID='general_settings.help.action'
                            defaultMessage='Help'
                            i18nId={t('mobile.help.title')}
                            onPress={this.openHelp}
                            showArrow={false}
                            theme={theme}
                            separator={true}
                            isLink={true}
                        />
                    } */}
                    <SettingsItem
                        testID='general_settings.report.action'
                        defaultMessage='Report a Problem'
                        i18nId={t('sidebar_right_menu.report')}
                        onPress={this.openErrorEmail}
                        showArrow={false}
                        theme={theme}
                        separator={false}
                        isLink={true}
                    />
                    <View style={style.divider}/>
                </ScrollView>
            </SafeAreaView>
        );
    }
}

const getStyleSheet = makeStyleSheetFromTheme((theme) => {
    return {
        container: {
            flex: 1,
            backgroundColor: theme.centerChannelBg,
        },
        wrapper: {
            backgroundColor: changeOpacity(theme.centerChannelColor, 0.06),
            ...Platform.select({
                ios: {
                    flex: 1,
                    paddingTop: 35,
                },
            }),
        },
        divider: {
            backgroundColor: changeOpacity(theme.centerChannelColor, 0.1),
            height: 1,
        },
        middleDivider: {
            borderTopWidth: 1,
            borderBottomWidth: 1,
            borderColor: changeOpacity(theme.centerChannelColor, 0.1),
            height: 35,
        },
    };
});

export default injectIntl(Settings);
