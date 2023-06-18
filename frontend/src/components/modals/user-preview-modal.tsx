import { FC } from "react";
import { MiniUser, User } from "../../../../shared/interfaces/user.interface";

type UserPreviewModalProps = {
  user: MiniUser;
  userPreviewModalPosition?: any;
  onToggleFollow: () => void;
};

export const UserPreviewModal: FC<UserPreviewModalProps> = ({
  user,
  userPreviewModalPosition,
  onToggleFollow,
}) => {
  return (
    <section className="user-preview-modal" style={userPreviewModalPosition}>
      <button onClick={onToggleFollow}></button>

      <div>
        <pre>
          <code>{JSON.stringify(user, null, 2)}</code>
        </pre>
      </div>
    </section>
  );
};
