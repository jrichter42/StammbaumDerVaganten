using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Runtime.Serialization;
using System.Text;
using System.Threading.Tasks;

namespace StammbaumDerVaganten
{
    public enum GroupType_Type
    {
        None,
        Stamm,
        Meute,
        Rudel,
        Gilde,
        Sippe,
        Runde,
        Kreis
    }

    [DataContract]
    public class GroupType : DataPiece<GroupType_Type>
    {

    }

    [DataContract]
    public class Group : DataObject, INotifyPropertyChanged
    {
        public static int NEXT_ID = 1;

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
        public GroupType _T
        {
            get { return type; }
            set { type = value; }
        }
        [DataMember]
        public String _N
        {
            get { return name; }
            set { name = value; }
        }
        [DataMember]
        public int _PG
        {
            get { return ParentGroup; }
            set { ParentGroup = value; }
        }
        [DataMember]
        public ObservableCollection<int> _SG
        {
            get { return SubGroups; }
            set { SubGroups = value; }
        }
        [DataMember]
        public String _C
        {
            get { return comment; }
            set { comment = value; }
        }
        #endregion

        protected GroupType type = new GroupType();
        protected String name = new String();
        protected int parentGroup = Group.ID_INVALID;
        protected ObservableCollection<int> subGroups = new ObservableCollection<int>();
        
        protected String comment = new String();

        #region Accessors
        public GroupType_Type Type
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

        public string Name
        {
            get { return name.Value; }
            set
            {
                if (name.Value != value)
                {
                    name.Value = value;
                    NotifyPropertyChanged();
                }
            }
        }

        public int ParentGroup
        {
            get { return parentGroup; }
            set
            {
                if (parentGroup != value)
                {
                    parentGroup = value;
                    NotifyPropertyChanged();
                }
            }
        }

        public ObservableCollection<int> SubGroups
        {
            get { return subGroups; }
            set
            {
                if (subGroups != value)
                {
                    subGroups = value;
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

        public Group() : base()
        {
            type.Init(GroupType_Type.None);
        }

        public Group(bool claimID) : base(claimID)
        {

        }

        public void ReassignID(int id)
        {
            ID = id;
        }

        public void AssignNewID()
        {
            ID = NEXT_ID++;
        }
    }
}
