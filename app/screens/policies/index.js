// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import {getTheme} from '@mm-redux/selectors/entities/preferences';
import {isLandscape} from '@selectors/device';
import Policies from './policies';

function mapStateToProps(state) {
    return {
        isLandscape: isLandscape(state),
        theme: getTheme(state),
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Policies);
