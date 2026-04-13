package team.pickz.api.domain.member.domain;

public enum Role {
    GUEST, USER, ADMIN;

    public String getAuthority() {
        return "ROLE_" + this.name();
    }

}
