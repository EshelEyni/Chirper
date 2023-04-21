import React from "react";
import { GoGlobe } from "react-icons/go";
import { ReactComponent as ChirperCircleIcon } from "../../assets/svg/chirper-circle-solid.svg";
import { AiOutlineCheck } from "react-icons/ai";

interface AudiencePickerModalProps {
  audience: { title: string; value: string };
  setAudience: React.Dispatch<
    React.SetStateAction<{
      title: string;
      value: string;
    }>
  >;
  toggleModal: (type: string) => void;
}

export const AudiencePickerModal: React.FC<AudiencePickerModalProps> = ({
  audience,
  setAudience,
  toggleModal,
}) => {
  const iconClassName = "picker-modal-option-icon";
  const audinceOptions = [
    {
      title: "Everyone",
      icon: <GoGlobe className={iconClassName} />,
      value: "everyone",
      isSelected: audience.value === "everyone",
    },
    {
      title: "Chirper Circle",
      icon: <ChirperCircleIcon className={iconClassName} />,
      value: "chirper-circle",
      isSelected: audience.value === "chirper-circle",
    },
  ];

  return (
    <React.Fragment>
      <div className="main-screen" onClick={() => toggleModal("audience")} />
      <section className="picker-modal">
        <h1 className="picker-modal-title">Choose audience</h1>
        <div className="picker-modal-options">
          {audinceOptions.map((option) => (
            <div
              key={option.title}
              className="picker-modal-option"
              onClick={() => {
                setAudience(option);
                toggleModal("audience");
              }}
            >
              <div className="picker-modal-option-main-content">
                <div className="picker-modal-option-icon-container">
                  {option.icon}
                </div>
                <div className="picker-modal-option-text">
                  {option.title}
                </div>
              </div>
              {option.isSelected && <AiOutlineCheck className="check-icon"/>}
            </div>
          ))}
        </div>
      </section>
    </React.Fragment>
  );
};
