// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect, useState} from 'react';
import {
    Text,
    View,
    StyleSheet,
    ActivityIndicator,
    SafeAreaView,
    Keyboard,
} from 'react-native';
import {dismissOverlay} from '@actions/navigation';
import {Client4} from '@mm-redux/client';
import CompassIcon from '@components/compass_icon';
import {matchDeepLink} from '@utils/url';
import {preventDoubleTap} from '@utils/tap';

export default function VerifyEmail(props) {
    const [isLoading, setIsLoading] = useState(true);
    const [msg, setMsg] = useState('Verifying Email');
    const [error, setError] = useState(null);

    const getToken = (url) => {
        const match = matchDeepLink(url, props.serverUrl, props.siteUrl);
        return match?.token || '';
    };

    const [token] = useState(getToken(props.verificationUrl));
    props.actions.setDeepLinkURL('');

    const onContinue = () => {
        dismissOverlay(props.componentId);
    };

    const onVerify = preventDoubleTap(() => {
        setError(null);
        setIsLoading(true);
        if (token) {
            Client4.verifyUserEmail(token).then(() => {
                setIsLoading(false);
                setMsg('Email Verified');
            }).catch((result) => {
                setIsLoading(false);
                setError(result.message);
            });
        } else {
            setIsLoading(false);
            setError('Invalid Link');
        }
    });

    useEffect(() => {
        Keyboard.dismiss();
        onVerify();
        return () => {
            dismissOverlay(props.componentId);
        };
    }, []);

    return (
        <SafeAreaView style={style.container}>
            <View style={style.outerContainer}>
                <View style={style.innerContainer}>
                    <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                        <Text style={{flex: 1, color: '#fff', fontSize: 16, margin: 20}}>{'Verify Email'}</Text>
                        <CompassIcon
                            style={{alignSelf: 'flex-end', margin: 16}}
                            name='close'
                            color='#fff'
                            size={24}
                            onPress={onContinue}
                        />
                    </View>
                    <View style={{margin: 20, marginBottom: 50, alignSelf: 'stretch', alignItems: 'center'}}>
                        {!error && <Text style={style.text}>{msg}</Text>}
                        {error &&
                        <Text style={style.error}>{error}</Text>}
                        {isLoading &&
                        <ActivityIndicator
                            size='large'
                            color='#00f'
                            style={{margin: 10}}
                        />}
                    </View>
                </View>
            </View>
        </SafeAreaView>);
}

const style = StyleSheet.create({
    container: {
        flex: 1,
    },
    outerContainer: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: '#000c',
    },
    innerContainer: {
        alignItems: 'center',
        backgroundColor: '#121212',
        margin: 20,
        borderRadius: 10,
    },
    text: {
        color: '#fff',
        fontSize: 16,
        marginBottom: 30,
    },
    buttons: {
        color: '#fff',
        fontSize: 16,
    },
    error: {
        color: '#e22',
        fontSize: 16,
        marginBottom: 30,
    },
});
