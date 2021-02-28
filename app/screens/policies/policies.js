// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {ActivityIndicator, ScrollView, View} from 'react-native';

import {popTopScreen} from '@actions/navigation';
import Markdown from '@components/markdown';
import SafeAreaView from '@components/safe_area_view';
import {getMarkdownTextStyles, getMarkdownBlockStyles} from '@utils/markdown';
import {changeOpacity, makeStyleSheetFromTheme} from '@utils/theme';
import {Client4} from '@mm-redux/client';
import ErrorText from '@components/error_text/error_text';

export default class Policies extends React.PureComponent {
    static propTypes = {
        theme: PropTypes.object.isRequired,
        type: PropTypes.string,
    }

    close = () => {
        popTopScreen();
    };

    constructor() {
        super();
        this.state = {
            isLoading: true,
            error: '',
            bannerText: '',
        };
    }

    componentDidMount() {
        Client4.getPolicies().then((policy) => {
            this.setState({
                isLoading: false,
                bannerText: this.props.type === 'tos' ? policy['t&c'] : policy.community,
            });
        }).catch((error) => {
            this.setState({
                error: 'Failed to load',
                isLoading: false,
            });
        });
    }

    dismissBanner = () => {
        this.close();
    };

    handleChannelLinkPress = () => {
        this.close();
    };

    render() {
        const {theme} = this.props;
        const {bannerText, isLoading, error} = this.state;
        const style = getStyleSheet(theme);

        return (
            <SafeAreaView excludeHeader={true}>
                <View style={style.container}>
                    <ScrollView
                        style={style.scrollContainer}
                        contentContainerStyle={style.textContainer}
                    >
                        {isLoading &&
                        <ActivityIndicator
                            size='large'
                            color='#00f'
                        />}
                        {error !== '' &&
                        <ErrorText
                            error={error}
                            theme={theme}
                        />
                        }
                        {bannerText !== '' &&
                        <Markdown
                            baseTextStyle={style.baseTextStyle}
                            blockStyles={getMarkdownBlockStyles(theme)}
                            disableGallery={true}
                            onChannelLinkPress={this.handleChannelLinkPress}
                            textStyles={getMarkdownTextStyles(theme)}
                            value={bannerText}
                        />
                        }
                    </ScrollView>
                </View>
            </SafeAreaView>
        );
    }
}

const getStyleSheet = makeStyleSheetFromTheme((theme) => {
    return {
        container: {
            flex: 1,
        },
        scrollContainer: {
            flex: 1,
        },
        textContainer: {
            padding: 15,
        },
        baseTextStyle: {
            color: theme.centerChannelColor,
            fontSize: 15,
            lineHeight: 20,
        },
        dismissContainer: {
            borderTopColor: changeOpacity(theme.centerChannelColor, 0.2),
            borderTopWidth: 1,
            padding: 10,
        },
        dismissButton: {
            alignSelf: 'stretch',
            backgroundColor: theme.sidebarHeaderBg,
            borderRadius: 3,
            padding: 15,
        },
        dismissButtonText: {
            color: theme.sidebarHeaderTextColor,
            fontSize: 15,
            fontWeight: '600',
            textAlign: 'center',
        },
    };
});
