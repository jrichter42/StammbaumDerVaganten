using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Runtime.CompilerServices;
using System.Runtime.Serialization;

namespace StammbaumDerVaganten
{

    [DataContract]
    public class Scout : DataParticle, INotifyPropertyChanged
    {
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
        public String _FN
        {
            get { return forename; }
            set { forename = value; }
        }
        [DataMember]
        public String _LN
        {
            get { return lastname; }
            set { lastname = value; }
        }
        [DataMember]
        public String _SN
        {
            get { return scoutname; }
            set { scoutname = value; }
        }
        [DataMember]
        public Date _BD
        {
            get { return birthdate; }
            set { birthdate = value; }
        }
        [DataMember]
        public String _CI
        {
            get { return contactInfo; }
            set { contactInfo = value; }
        }
        [DataMember]
        public String _C
        {
            get { return comment; }
            set { comment = value; }
        }
        [DataMember]
        public ObservableCollection<Membership> _M
        {
            get { return memberships; }
            set { memberships = value; }
        }
        [DataMember]
        public ObservableCollection<Activity> _A
        {
            get { return activities; }
            set { activities = value; }
        }
        #endregion

        protected String forename = new String();
        protected String lastname = new String();
        protected String scoutname = new String();

        protected Date birthdate = new Date();

        protected String contactInfo = new String();
        protected String comment = new String();

        protected List<Membership> memberships = new List<Membership>();
        protected List<Activity> activities = new List<Activity>();

        #region Accessors
        public String Forename
        {
            get { return forename; }
            set { forename = value; }
        }

        public String Lastname
        {
            get { return lastname; }
            set { lastname = value; }
        }

        public String Scoutname
        {
            get { return scoutname; }
            set { scoutname = value; }
        }

        public Date Birthdate
        {
            get { return birthdate; }
            set { birthdate = value; }
        }

        public String ContactInfo
        {
            get { return contactInfo; }
            set { contactInfo = value; }
        }

        public String Comment
        {
            get { return comment; }
            set { comment = value; }
        }

        public List<Membership> Memberships
        {
            get { return memberships; }
            set { memberships = value; }
        }

        public List<Activity> Activities
        {
            get { return activities; }
            set { activities = value; }
        }
        #endregion

        public Scout() : base()
        {

        }

        #region Retrieve Memberships and Activities
        public Membership GetFirstMembershipByGroup(Group group)
        {
            ObservableCollection<Membership> result = new ObservableCollection<Membership>();
            foreach (Membership ms in memberships)
            {
                if (ms.Group == group)
                {
                    return ms;
                }
            }
            return null;
        }

        public Activity GetFirstActivityByGroup(Group group)
        {
            foreach (Activity a in activities)
            {
                if (a.Group == group)
                {
                    return a;
                }
            }
            return null;
        }

        public ObservableCollection<Membership> GetMembershipsInGroup(Group group)
        {
            ObservableCollection<Membership> result = new ObservableCollection<Membership>();
            foreach (Membership ms in memberships)
            {
                if (ms.Group == group)
                {
                    result.Add(ms);
                }
            }
            return result;
        }

        public ObservableCollection<Activity> GetActivitiesInGroup(Group group)
        {
            ObservableCollection<Activity> result = new ObservableCollection<Activity>();
            foreach (Activity a in activities)
            {
                if (a.Group == group)
                {
                    result.Add(a);
                }
            }
            return result;
        }
        #endregion

    }
}
