using System;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Runtime.CompilerServices;
using System.Runtime.Serialization;

namespace StammbaumDerVaganten
{
    [DataContract]
    public class Participation : DataParticle
    {
        #region Serialization
        [DataMember]
        public Timespan _TSP
        {
            get { return timespan; }
            set { timespan = value; }
        }
        [DataMember]
        public int _G
        {
            get { return group; }
            set { group = value; }
        }
        #endregion

        protected Timespan timespan = new Timespan();
        protected int group = StammbaumDerVaganten.Group.ID_INVALID;

        #region Accessors
        public Timespan Timespan
        {
            get { return timespan; }
            set { timespan = value; }
        }

        public int Group
        {
            get { return group; }
            set { group = value; }
        }
        #endregion

        public Participation() : base()
        {

        }
    }

    [DataContract]
    public class Membership : Participation
    {
        public Membership() : base()
        {

        }
    }

    [DataContract]
    public class Activity : Participation
    {
        #region Serialization
        [DataMember]
        public int _R
        {
            get { return role; }
            set { role = value; }
        }
        #endregion

        protected int role = StammbaumDerVaganten.Role.ID_INVALID;

        #region Accessors
        public int Role
        {
            get { return role; }
            set { role = value; }
        }
        #endregion

        public Activity() : base()
        {

        }
    }

}
