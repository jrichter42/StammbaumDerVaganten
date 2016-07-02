using System;
using System.ComponentModel;
using System.Runtime.CompilerServices;
using System.Runtime.Serialization;

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
        public Timespan _TSP
        {
            get { return timespan; }
            set { timespan = value; }
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
        protected Timespan timespan = new Timespan();
        
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

        public Timespan Timespan
        {
            get { return timespan; }
            set
            {
                if (timespan != value)
                {
                    timespan = value;
                    NotifyPropertyChanged();
                }
            }
        }

        public DateTime Start_
        {
            get { return timespan.Start.Value; }
            set
            {
                if (timespan.Start.Value != value)
                {
                    timespan.Start.Value = value;
                    NotifyPropertyChanged();
                }
            }
        }

        public DateTime End_
        {
            get { return timespan.End.Value; }
            set
            {
                if (timespan.End.Value != value)
                {
                    timespan.End.Value = value;
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

        public override string ToString()
        {
            return id.ToString() + " " + type.Value.ToString() + " " + name.Value;
        }

        public string ToString_
        {
            get { return ToString(); }
        }
    }
}
