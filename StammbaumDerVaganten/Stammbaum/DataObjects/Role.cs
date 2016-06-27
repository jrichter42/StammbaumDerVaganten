using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Runtime.Serialization;
using System.Text;
using System.Threading.Tasks;

namespace StammbaumDerVaganten
{
    public enum RoleType_Type
    {
        None,
        Custom,
        Stammesfuehrung,
        StellvStammesfuehrung,
        Kassenwart,
        StellvKassenwart,
        Handkasse,
        Meutenfuehrung,
        Meutenassi,
        Rudelfuehrung,
        Sippenfuehrung,
        Gildensprecher,
        Rundensprecher,
        Kreisleitung
    }

    [DataContract]
    public class RoleType : DataPiece<RoleType_Type>
    {

    }

    [DataContract]
    public class Role : DataObject, INotifyPropertyChanged
    {
        protected static int NEXT_ID = 1;

        protected override int GetNEXTID()
        {
            return NEXT_ID;
        }

        protected override void SetNEXTID(int id)
        {
            NEXT_ID = id;
        }

        #region INotifyPropertyChanged
        public event PropertyChangedEventHandler PropertyChanged;

        private void NotifyPropertyChanged([CallerMemberName] string propertyName = "")
        {
            if (PropertyChanged != null)
            {
                PropertyChanged(this, new PropertyChangedEventArgs(propertyName));
            }
        }
        #endregion

        #region Serialization
        [DataMember]
        public RoleType _T
        {
            get { return type; }
            set { type = value; }
        }
        [DataMember]
        public String _CT
        {
            get { return customType; }
            set { customType = value; }
        }
        [DataMember]
        public GroupType _GT
        {
            get { return groupType; }
            set { groupType = value; }
        }
        [DataMember]
        public String _C
        {
            get { return comment; }
            set { comment = value; }
        }
        #endregion

        protected RoleType type = new RoleType();
        protected String customType = new String(); //If Type set to "Custom"
        protected GroupType groupType = new GroupType(); //This role can be held on Groups of this type

        protected String comment = new String();

        #region Accessors
        public RoleType_Type Type
        {
            get { return type.Value; }
            set
            {
                if (type.Value != value)
                {
                    type.Value = value;
                    NotifyPropertyChanged();
                }
            }
        }

        public string CustomType
        {
            get { return customType.Value; }
            set
            {
                if (customType.Value != value)
                {
                    customType.Value = value;
                    NotifyPropertyChanged();
                }
            }
        }

        public GroupType_Type GroupType
        {
            get { return groupType.Value; }
            set
            {
                if (groupType.Value != value)
                {
                    groupType.Value = value;
                    NotifyPropertyChanged();
                }
            }
        }

        public string Comment
        {
            get { return comment.Value; }
            set
            {
                if (comment.Value != value)
                {
                    comment.Value = value;
                    NotifyPropertyChanged();
                }
            }
        }
        #endregion

        public Role() : base()
        {
            type.Init(RoleType_Type.None);

            HookPropertyChanged();
        }

        public Role(bool claimID) : base(claimID)
        {
            HookPropertyChanged();
        }

        private void HookPropertyChanged()
        {
            type.PropertyChanged += PropertyChanged;
            customType.PropertyChanged += PropertyChanged;
            groupType.PropertyChanged += PropertyChanged;
            comment.PropertyChanged += PropertyChanged;
        }
    }
}
