// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';

import {
    View,
} from 'react-native';
import {intlShape} from 'react-intl';
import {SafeAreaView} from 'react-native-safe-area-context';

import {General} from '@mm-redux/constants';
import FormattedText from 'app/components/formatted_text';
import StatusBar from 'app/components/status_bar';
import TextInputWithLocalizedPlaceholder from 'app/components/text_input_with_localized_placeholder';
import {getNotificationProps} from 'app/utils/notify_props';
import {
    changeOpacity,
    makeStyleSheetFromTheme,
    getKeyboardAppearanceFromTheme,
} from 'app/utils/theme';
import {t} from 'app/utils/i18n';

import Section from 'app/screens/settings/section';
import SectionItem from 'app/screens/settings/section_item';
import {popTopScreen, setButtons} from '@actions/navigation';
import {Navigation} from 'react-native-navigation';

export default class NotificationSettingsAutoResponder extends PureComponent {
    static propTypes = {
        currentUser: PropTypes.object.isRequired,
        onBack: PropTypes.func.isRequired,
        theme: PropTypes.object.isRequired,
        currentUserStatus: PropTypes.string.isRequired,
        componentId: PropTypes.string.isRequired,
    };

    static contextTypes = {
        intl: intlShape,
    };

    constructor(props, context) {
        super(props, context);
        const {currentUser} = props;
        const {intl} = this.context;
        const notifyProps = getNotificationProps(currentUser);

        this.autoresponderRef = React.createRef();

        const autoResponderDefault = intl.formatMessage({
            id: 'mobile.notification_settings.auto_responder.default_message',
            defaultMessage: 'Hello, I am out of office and unable to respond to messages.',
        });

        let autoResponderActive = 'false';
        if (props.currentUserStatus === General.OUT_OF_OFFICE && notifyProps.auto_responder_active) {
            autoResponderActive = 'true';
        }

        this.state = {
            ...notifyProps,
            auto_responder_active: autoResponderActive,
            auto_responder_message: notifyProps.auto_responder_message || autoResponderDefault,
        };

        this.saveButton = {
            color: props.theme.sidebarHeaderTextColor,
            enabled: true,
            id: 'save-autoresponder',
            showAsAction: 'always',
            text: 'Save',
        };

        setButtons(props.componentId, {
            rightButtons: [this.saveButton],
        });
    }

    componentWillUnmount() {
        this.saveUserNotifyProps();
        this.navigationEventListener.remove();
    }

    componentDidMount() {
        setTimeout(() => {
            requestAnimationFrame(() => {
                if (this.autoresponderRef.current) {
                    this.autoresponderRef.current.focus();
                }
            });
        }, 500);

        this.navigationEventListener = Navigation.events().registerNavigationButtonPressedListener(
            ({buttonId}) => {
                if (buttonId === this.saveButton.id) {
                    popTopScreen();
                }
            },
        );
    }

    saveUserNotifyProps = () => {
        this.props.onBack({
            ...this.state,
            user_id: this.props.currentUser.id,
        });
    };

    onAutoResponseToggle = (active) => {
        if (active) {
            this.setState({auto_responder_active: 'true'});
            return;
        }
        this.setState({auto_responder_active: 'false'});
    };

    onAutoResponseChangeText = (message) => {
        this.setState({auto_responder_message: message});
    };

    render() {
        const {theme} = this.props;
        const {
            auto_responder_active: autoResponderActive,
            auto_responder_message: autoResponderMessage,
        } = this.state;
        const style = getStyleSheet(theme);

        const autoResponderActiveLabel = (
            <FormattedText
                id='mobile.notification_settings.auto_responder.enabled'
                defaultMessage='Enabled'
            />
        );

        return (
            <SafeAreaView
                edges={['left', 'right']}
                style={style.container}
            >
                <StatusBar/>
                <View style={style.wrapper}>
                    <Section
                        disableHeader={true}
                        theme={theme}
                    >
                        <SectionItem
                            label={autoResponderActiveLabel}
                            action={this.onAutoResponseToggle}
                            actionType='toggle'
                            selected={autoResponderActive === 'true'}
                            theme={theme}
                        />
                    </Section>
                    {autoResponderActive === 'true' && (
                        <Section
                            headerId={t('mobile.notification_settings.auto_responder.message_title')}
                            headerDefaultMessage='CUSTOM MESSAGE'
                            theme={theme}
                        >
                            <View style={style.inputContainer}>
                                <TextInputWithLocalizedPlaceholder
                                    ref={this.autoresponderRef}
                                    value={autoResponderMessage}
                                    blurOnSubmit={false}
                                    onChangeText={this.onAutoResponseChangeText}
                                    multiline={true}
                                    style={style.input}
                                    autoCapitalize='none'
                                    autoCorrect={false}
                                    placeholder={{id: t('mobile.notification_settings.auto_responder.message_placeholder'), defaultMessage: 'Message'}}
                                    placeholderTextColor={changeOpacity(theme.centerChannelColor, 0.4)}
                                    textAlignVertical='top'
                                    underlineColorAndroid='transparent'
                                    returnKeyType='done'
                                    keyboardAppearance={getKeyboardAppearanceFromTheme(theme)}
                                />
                            </View>
                        </Section>
                    )}
                    <FormattedText
                        id={'mobile.notification_settings.auto_responder.footer_message'}
                        defaultMessage={'Set a custom message that will be automatically sent in response to Direct Messages. Mentions in Public and Private Channels will not trigger the automated reply. Enabling Automatic Replies sets your status to Out of Office and disables email and push notifications.'}
                        style={style.footer}
                    />
                </View>
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
            flex: 1,
            paddingTop: 35,
        },
        inputContainer: {
            borderTopWidth: 1,
            borderBottomWidth: 1,
            borderTopColor: changeOpacity(theme.centerChannelColor, 0.1),
            borderBottomColor: changeOpacity(theme.centerChannelColor, 0.1),
            backgroundColor: theme.centerChannelBg,
        },
        input: {
            color: theme.centerChannelColor,
            fontSize: 15,
            height: 150,
            paddingHorizontal: 15,
            paddingVertical: 10,
        },
        footer: {
            marginHorizontal: 15,
            fontSize: 12,
            color: changeOpacity(theme.centerChannelColor, 0.5),
        },
    };
});
