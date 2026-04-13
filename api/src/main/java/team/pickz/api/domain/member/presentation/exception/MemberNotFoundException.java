package team.pickz.api.domain.member.presentation.exception;

import team.pickz.api.global.exception.CustomException;

public class MemberNotFoundException extends CustomException {

    public MemberNotFoundException() {
        super(MemberExceptionCode.MEMBER_NOT_FOUND);
    }

}
