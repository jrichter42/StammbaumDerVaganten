using System.Collections.Generic;
using System.ComponentModel;
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
    public class GroupPhase
    {
        #region Serialization
        [DataMember]
        public GroupType _T
        {
            get { return type; }
            set { type = value; }
        }
        [DataMember]
        public Timespan _TSP
        {
            get { return timespan; }
            set { timespan = value; }
        }
        #endregion

        protected GroupType type = new GroupType();
        protected Timespan timespan = new Timespan();

        #region Accessors
        public GroupType Type
        {
            get { return type; }
            set { type = value; }
        }

        public Timespan Timespan
        {
            get { return timespan; }
            set { timespan = value; }
        }
        #endregion
        
        public GroupPhase() : base()
        {
            type.Init(GroupType_Type.None);
        }
    }

    [DataContract]
    public class Group : DataObject
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

        #region Serialization

        [DataMember]
        public GroupPhase _MP
        {
            get { return mainPhase; }
            set { mainPhase = value; }
        }

        [DataMember]
        public List<GroupPhase> _AP
        {
            get { return additionalPhases; }
            set { additionalPhases = value; }
        }
        
        [DataMember]
        public String _N
        {
            get { return name; }
            set { name = value; }
        }
        
        [DataMember]
        public String _C
        {
            get { return comment; }
            set { comment = value; }
        }
        #endregion

        protected GroupPhase mainPhase = new GroupPhase();
        protected List<GroupPhase> additionalPhases = new List<GroupPhase>();
        
        protected String name = new String();
        
        protected String comment = new String();

        #region Accessors
        public GroupPhase MainPhase
        {
            get { return mainPhase; }
            set { mainPhase = value; }  
        }

        public GroupType Type
        {
            get { return mainPhase.Type; }
            set { mainPhase.Type = value; }
        }

        public String Name
        {
            get { return name; }
            set { name = value; }
        }

        public Timespan Timespan
        {
            get { return mainPhase.Timespan; }
            set { mainPhase.Timespan = value; }
        }

        public String Comment
        {
            get { return comment; }
            set { comment = value; }
        }

        public List<GroupPhase> AdditionalPhases
        {
            get { return additionalPhases; }
            set { additionalPhases = value; }
        }
        #endregion

        public Group() : base()
        {

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
            return mainPhase.Timespan.Start.Year + " " + mainPhase.Type.ToString() + " " + name.Value + " [" + id.ToString() + "]";
        }

        public string ToString_
        {
            get { return ToString(); }
        }
    }
}
