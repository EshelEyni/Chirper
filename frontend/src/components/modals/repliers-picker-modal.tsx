import React from "react";
import { AiOutlineCheck } from "react-icons/ai";
import { FaAt, FaGlobeAmericas, FaUserCheck } from "react-icons/fa";

interface RepliersPickerModalProps {
  replierSetting: { title: string; icon: React.ReactElement; value: string };
  setReplierSetting: React.Dispatch<
    React.SetStateAction<{
      title: string;
      icon: React.ReactElement;
      value: string;
    }>
  >;
  toggleModal: (type: string) => void;
}

export const RepliersPickerModal: React.FC<RepliersPickerModalProps> = ({
  replierSetting,
  setReplierSetting,
  toggleModal,
}) => {
  const iconClassName = "picker-modal-option-icon";

  const replierOptions = [
    {
      title: "Everyone",
      icon: <FaGlobeAmericas className={iconClassName} />,
      value: "everyone",
      isSelected: replierSetting.value === "everyone",
    },
    {
      title: "Only people you follow",
      icon: <FaUserCheck className={iconClassName} />,
      value: "chirper-circle",
      isSelected: replierSetting.value === "chirper-circle",
    },
    {
      title: "Only people you mentioned",
      icon: <FaAt className={iconClassName} />,
      value: "mentioned",
      isSelected: replierSetting.value === "mentioned",
    },
  ];

  return (
    <React.Fragment>
      <div className="main-screen" onClick={() => toggleModal("repliers")} />
      <section className="picker-modal repliers">
        <h1 className="picker-modal-title">Choose who can reply</h1>
        <div className="picker-modal-options">
          {replierOptions.map((option) => (
            <div
              key={option.title}
              className="picker-modal-option"
              onClick={() => {
                setReplierSetting(option);
                toggleModal("repliers");
              }}
            >
              <div className="picker-modal-option-main-content">
                <div className="picker-modal-option-icon-container">
                  {option.icon}
                </div>
                <div className="picker-modal-option-text repliers">{option.title}</div>
              </div>
              {option.isSelected && <AiOutlineCheck className="check-icon" />}
            </div>
          ))}
        </div>
      </section>
    </React.Fragment>
  );
};
